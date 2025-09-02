#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  baseUrl: 'https://wp.lodelnico.com/wp-json/wp/v2',
  perPage: 100,
  timeout: 10000,
  maxRetries: 3,
};

/**
 * Create AbortController with timeout
 */
function createTimeoutController(timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  // Clean up timeout when signal is used
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });
  
  return controller;
}

/**
 * Robust fetch with retry logic
 */
async function robustFetch(url, options = {}) {
  let lastError;
  
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    const controller = createTimeoutController(CONFIG.timeout);
    
    try {
      console.log(`Fetching: ${url} (attempt ${attempt}/${CONFIG.maxRetries})`);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      if (response.status === 400) {
        // Out of range page - this is expected at the end
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < CONFIG.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Extract featured image URL from embedded data
 */
function getFeaturedImageURL(post) {
  try {
    const featured = post._embedded?.['wp:featuredmedia']?.[0];
    if (!featured) return null;
    
    const sizes = featured.media_details?.sizes;
    if (!sizes) return featured.source_url;
    
    // Prefer large > medium_large > source_url
    return sizes.large?.source_url || 
           sizes.medium_large?.source_url || 
           featured.source_url;
  } catch (error) {
    console.warn('Error extracting featured image:', error.message);
    return null;
  }
}

/**
 * Extract first image URL from post content
 */
function getFirstImageFromContent(post) {
  try {
    const content = post.content?.rendered;
    if (!content) return null;
    
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    return imgMatch ? imgMatch[1] : null;
  } catch (error) {
    console.warn('Error extracting image from content:', error.message);
    return null;
  }
}

/**
 * Fetch first attachment image for a post
 */
async function fetchFirstAttachment({ baseUrl, postId, signal }) {
  try {
    const url = `${baseUrl}/media?parent=${postId}&media_type=image&per_page=1&orderby=menu_order&order=asc`;
    const response = await fetch(url, { signal });
    
    if (!response.ok) return null;
    
    const attachments = await response.json();
    if (!attachments.length) return null;
    
    const attachment = attachments[0];
    const sizes = attachment.media_details?.sizes;
    
    if (!sizes) return attachment.source_url;
    
    return sizes.large?.source_url || 
           sizes.medium_large?.source_url || 
           attachment.source_url;
  } catch (error) {
    console.warn(`Error fetching attachments for post ${postId}:`, error.message);
    return null;
  }
}

/**
 * Resolve image URL for a post using fallback chain
 */
async function resolvePostImage({ baseUrl, post, signal }) {
  // 1. Try featured image from embedded data
  let imageUrl = getFeaturedImageURL(post);
  if (imageUrl) {
    console.log(`✓ Featured image found for post ${post.id}`);
    return imageUrl;
  }
  
  // 2. Try first image from content
  imageUrl = getFirstImageFromContent(post);
  if (imageUrl) {
    console.log(`✓ Content image found for post ${post.id}`);
    return imageUrl;
  }
  
  // 3. Try first attachment
  imageUrl = await fetchFirstAttachment({ baseUrl, postId: post.id, signal });
  if (imageUrl) {
    console.log(`✓ Attachment image found for post ${post.id}`);
    return imageUrl;
  }
  
  console.warn(`✗ No image found for post ${post.id}: "${post.title?.rendered}"`);
  return null;
}

/**
 * Strip HTML tags and decode entities
 */
function stripHTML(html) {
  if (!html) return '';
  
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Remove only the first <img> tag from HTML content
 */
function removeFirstImageTag(html = '') {
  if (!html) return '';
  // Remove only the first <img ...> occurrence (case insensitive)
  return html.replace(/<img[^>]*>/i, '');
}

/**
 * Basic HTML sanitization for security
 */
function sanitizeBasic(html = '') {
  if (!html) return '';
  
  return html
    // Remove dangerous tags
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?<\/embed>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    
    // Remove dangerous attributes
    .replace(/\son\w+="[^"]*"/gi, '') // onclick, onload, etc.
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/\sjavascript:/gi, '')
    .replace(/\sdata:/gi, '')
    .replace(/\svbscript:/gi, '')
    
    // Clean up common WordPress artifacts
    .replace(/\[caption[^\]]*\]/g, '')
    .replace(/\[\/caption\]/g, '')
    .replace(/\[gallery[^\]]*\]/g, '')
    .replace(/\[\/gallery\]/g, '')
    
    .trim();
}

/**
 * Clean and sanitize HTML content for security
 */
function sanitizeHTML(html) {
  if (!html) return '';
  
  return html
    // Remove dangerous tags
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
    .replace(/<object[^>]*>.*?<\/object>/gis, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gis, '')
    .replace(/<form[^>]*>.*?<\/form>/gis, '')
    
    // Remove dangerous attributes
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '') // onclick, onload, etc.
    .replace(/\s*javascript\s*:/gi, '')
    .replace(/\s*data\s*:/gi, '')
    .replace(/\s*vbscript\s*:/gi, '')
    
    // Clean up common WordPress artifacts
    .replace(/\[caption[^\]]*\]/g, '')
    .replace(/\[\/caption\]/g, '')
    .replace(/\[gallery[^\]]*\]/g, '')
    .replace(/\[\/gallery\]/g, '')
    
    // Ensure images have proper attributes for responsive behavior
    .replace(/<img([^>]*?)>/gi, (match, attrs) => {
      // Keep existing src, alt, title but remove width/height
      const cleanAttrs = attrs
        .replace(/\s*width\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\s*height\s*=\s*["'][^"']*["']/gi, '');
      return `<img${cleanAttrs} style="max-width:100%;height:auto;">`;
    })
    
    .trim();
}

/**
 * Fetch all posts with images from WordPress
 */
async function fetchAllPostsWithImages() {
  const allPosts = [];
  const processedIds = new Set();
  let page = 1;
  let totalPages = 1;
  
  console.log('🚀 Starting post data fetch...');
  
  do {
    const controller = createTimeoutController(CONFIG.timeout);
    
    try {
      // Fetch posts with embedded featured media
      const url = `${CONFIG.baseUrl}/posts?_embed=wp:featuredmedia&orderby=date&order=desc&per_page=${CONFIG.perPage}&page=${page}`;
      const response = await robustFetch(url, { signal: controller.signal });
      
      if (!response) {
        console.log(`📄 Reached end of posts at page ${page}`);
        break;
      }
      
      // Get total pages from headers
      const totalPagesHeader = response.headers.get('X-WP-TotalPages');
      if (totalPagesHeader && page === 1) {
        totalPages = parseInt(totalPagesHeader, 10);
        console.log(`📊 Total pages to process: ${totalPages}`);
      }
      
      const posts = await response.json();
      console.log(`📋 Processing page ${page} (${posts.length} posts)`);
      
      // Process posts sequentially to avoid overwhelming the API
      for (const post of posts) {
        // Skip duplicates
        if (processedIds.has(post.id)) {
          console.log(`⚠️  Skipping duplicate post ${post.id}`);
          continue;
        }
        
        processedIds.add(post.id);
        
        try {
          const imageUrl = await resolvePostImage({ 
            baseUrl: CONFIG.baseUrl, 
            post, 
            signal: controller.signal 
          });
          
          // Skip posts without images
          if (!imageUrl) {
            continue;
          }
          
          const postDate = new Date(post.date);
          
          // Prefer ACF's taken_at if present; otherwise use WordPress post date.
          // Always persist an ISO string we can format in Astro.
          const takenAtIso = post?.acf?.taken_at ?? post?.date;
          
          // Process content if available
          const contentRendered = post.content?.rendered || '';
          const contentText = contentRendered ? stripHTML(contentRendered) : '';
          
          // Sanitize and clean content
          const safeHtml = sanitizeBasic(contentRendered);
          const contentHtml = sanitizeHTML(contentRendered);
          const contentHtmlNoImg = removeFirstImageTag(safeHtml);
          
          const photoItem = {
            id: post.id,
            title: stripHTML(post.title?.rendered) || 'Untitled',
            date: post.date,
            taken_at: takenAtIso, // unified field for date-time formatting
            year: postDate.getFullYear(),
            url: post.link,
            image: imageUrl,
            contentHtml,
            contentText,
            contentHtmlNoImg,
          };
          
          allPosts.push(photoItem);
        } catch (error) {
          console.warn(`❌ Error processing post ${post.id}:`, error.message);
        }
      }
      
      console.log(`✅ Page ${page} complete`);
      page++;
      
      // Small delay between pages to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`⏱️  Request timeout on page ${page}`);
      } else {
        console.error(`❌ Error fetching page ${page}:`, error.message);
      }
      break;
    }
  } while (page <= totalPages);
  
  // Sort by date descending (most recent first)
  allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  console.log(`🎉 Fetch complete! Total posts with images: ${allPosts.length}`);
  return allPosts;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔄 Fetching photoblog data from WordPress posts...');
    
    const posts = await fetchAllPostsWithImages();
    
    // Ensure output directory exists
    const outputDir = join(__dirname, '..', 'src', 'data');
    const outputPath = join(outputDir, 'photoblog.json');
    
    mkdirSync(outputDir, { recursive: true });
    
    // Write JSON file
    writeFileSync(outputPath, JSON.stringify(posts, null, 2), 'utf-8');
    
    console.log(`💾 Saved ${posts.length} posts to ${outputPath}`);
    
    // Summary by year
    const yearCounts = posts.reduce((acc, post) => {
      acc[post.year] = (acc[post.year] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Posts by year:');
    Object.entries(yearCounts)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .forEach(([year, count]) => {
        console.log(`   ${year}: ${count} posts`);
      });
      
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === __filename) {
  main();
}
