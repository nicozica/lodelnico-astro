#!/bin/bash

# Backup current data
cp src/data/photoblog.json src/data/photoblog.json.backup

echo "🔄 Fetching real photoblog data from WordPress..."

# Create temporary files
TMP_DIR="/tmp/wordpress_fetch"
mkdir -p "$TMP_DIR"

# Fetch all pages of posts
ALL_POSTS="$TMP_DIR/all_posts.json"
echo "[]" > "$ALL_POSTS"

page=1
while true; do
    echo "Fetching page $page..."
    
    # Fetch page with timeout and retries
    response=$(curl -s --connect-timeout 30 --max-time 60 \
        "https://www.lodelnico.com/wp-json/wp/v2/posts?_embed=wp:featuredmedia&orderby=date&order=desc&per_page=100&page=$page")
    
    if [ $? -ne 0 ] || [ "$response" = "[]" ] || [[ "$response" == *"rest_post_invalid_page_number"* ]]; then
        echo "Finished at page $((page-1))"
        break
    fi
    
    # Append to all posts (merge JSON arrays)
    if [ $page -eq 1 ]; then
        echo "$response" > "$ALL_POSTS"
    else
        # Merge JSON arrays using jq if available, otherwise use simple concatenation
        if command -v jq >/dev/null 2>&1; then
            jq -s '.[0] + .[1]' "$ALL_POSTS" <(echo "$response") > "$TMP_DIR/merged.json"
            mv "$TMP_DIR/merged.json" "$ALL_POSTS"
        else
            # Fallback: simple concatenation (less elegant but works)
            temp_file="$TMP_DIR/temp_merge.json"
            head -n -1 "$ALL_POSTS" > "$temp_file"  # Remove last ]
            echo "," >> "$temp_file"                # Add comma
            tail -n +2 <(echo "$response") >> "$temp_file"  # Add new array content without first [
            mv "$temp_file" "$ALL_POSTS"
        fi
    fi
    
    page=$((page + 1))
done

echo "✅ Fetched data from $(expr $page - 1) pages"

# Process the WordPress data using Node.js
node -e "
const fs = require('fs');
const path = require('path');

// Read the raw WordPress data
const rawData = JSON.parse(fs.readFileSync('$ALL_POSTS', 'utf8'));
console.log(\`📝 Processing \${rawData.length} posts...\`);

const processedPhotos = [];

rawData.forEach((post) => {
  // Extract image from post content
  const imageMatch = post.content.rendered.match(/<img[^>]+src=[\"']([^\"']+)[\"'][^>]*>/);
  if (imageMatch) {
    const imageUrl = imageMatch[1]
      .replace(/&amp;/g, '&')
      .replace(/&#038;/g, '&');
    
    // Extract date and create year
    const postDate = new Date(post.date);
    
    processedPhotos.push({
      id: post.id,
      title: post.title.rendered.replace(/&#8[0-9]+;/g, '').trim(),
      date: post.date.split('T')[0],
      year: postDate.getFullYear(),
      image: imageUrl,
      url: post.link,
      contentHtml: post.content.rendered,
      contentText: post.content.rendered.replace(/<[^>]*>/g, '').trim()
    });
  }
});

console.log(\`✨ Processed \${processedPhotos.length} photos with images\`);

// Save to the data file
const outputPath = path.join(process.cwd(), 'src/data/photoblog.json');
fs.writeFileSync(outputPath, JSON.stringify(processedPhotos, null, 2));

console.log(\`💾 Saved to \${outputPath}\`);

// Show stats
const yearStats = processedPhotos.reduce((acc, photo) => {
  acc[photo.year] = (acc[photo.year] || 0) + 1;
  return acc;
}, {});

console.log('📊 Photos by year:');
Object.entries(yearStats).sort().forEach(([year, count]) => {
  console.log(\`  \${year}: \${count} photos\`);
});
"

# Cleanup
rm -rf "$TMP_DIR"

echo "🎉 Done! Your real photos have been restored."
