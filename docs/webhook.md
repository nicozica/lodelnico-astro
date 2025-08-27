# WordPress Webhook Setup

This document explains how to configure a WordPress webhook to automatically trigger the photoblog rebuild when new posts are published.

## Overview

When a post is published or updated in WordPress, a webhook will call the GitHub Actions API to trigger the `rebuild.yml` workflow, which will:

1. Fetch fresh data from WordPress
2. Update the `photoblog.json` file
3. Rebuild the Astro site
4. Deploy the updated site

## Setup Steps

### 1. Create a GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "WordPress Webhook Token"
4. Set expiration as needed
5. Select scope: `repo` (Full control of private repositories)
6. Copy the generated token (you won't see it again)

### 2. WordPress Plugin Method (Recommended)

Install a webhook plugin like **WP Webhooks** or **WP REST API Controller**:

#### Using WP Webhooks Plugin:

1. Install and activate the WP Webhooks plugin
2. Go to WP Admin → Settings → WP Webhooks → Send Data
3. Create a new webhook with these settings:
   - **Webhook URL**: `https://api.github.com/repos/nicozica/run-nico-ar/dispatches`
   - **Trigger**: `post_create` and `post_update`
   - **Method**: POST
   - **Headers**:
     ```
     Authorization: token YOUR_GITHUB_TOKEN
     Accept: application/vnd.github.v3+json
     Content-Type: application/json
     ```
   - **Body** (JSON):
     ```json
     {
       "event_type": "wp_photoblog_updated",
       "client_payload": {
         "post_id": "%%post_id%%",
         "post_title": "%%post_title%%",
         "post_date": "%%post_date%%",
         "timestamp": "%%current_timestamp%%"
       }
     }
     ```

### 3. Custom PHP Solution

If you prefer a custom solution, add this code to your theme's `functions.php`:

```php
<?php
/**
 * Trigger GitHub Actions rebuild when a post is published or updated
 */
function trigger_photoblog_rebuild($post_id, $post, $update) {
    // Only trigger for published posts
    if ($post->post_status !== 'publish') {
        return;
    }
    
    // Skip if this is an auto-save or revision
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    if (wp_is_post_revision($post_id)) {
        return;
    }
    
    // GitHub repository details
    $github_owner = 'nicozica';
    $github_repo = 'run-nico-ar';
    $github_token = 'YOUR_GITHUB_TOKEN'; // Replace with your token
    
    // Prepare the webhook payload
    $payload = [
        'event_type' => 'wp_photoblog_updated',
        'client_payload' => [
            'post_id' => $post_id,
            'post_title' => $post->post_title,
            'post_date' => $post->post_date,
            'post_url' => get_permalink($post_id),
            'timestamp' => current_time('mysql'),
            'is_update' => $update
        ]
    ];
    
    // GitHub API endpoint
    $url = "https://api.github.com/repos/{$github_owner}/{$github_repo}/dispatches";
    
    // Make the request
    $response = wp_remote_post($url, [
        'headers' => [
            'Authorization' => 'token ' . $github_token,
            'Accept' => 'application/vnd.github.v3+json',
            'Content-Type' => 'application/json',
            'User-Agent' => 'WordPress-Photoblog-Webhook'
        ],
        'body' => json_encode($payload),
        'timeout' => 30
    ]);
    
    // Log the result (optional)
    if (is_wp_error($response)) {
        error_log('Photoblog webhook error: ' . $response->get_error_message());
    } else {
        $code = wp_remote_retrieve_response_code($response);
        if ($code === 204) {
            error_log("Photoblog rebuild triggered for post: {$post->post_title} (ID: {$post_id})");
        } else {
            error_log("Photoblog webhook failed with code: {$code}");
        }
    }
}

// Hook into post save events
add_action('wp_insert_post', 'trigger_photoblog_rebuild', 10, 3);
```

### 4. Security Considerations

1. **Store the GitHub token securely**: 
   - Use environment variables or a secure configuration method
   - Never commit tokens to version control

2. **Rate limiting**: 
   - GitHub has API rate limits
   - Consider debouncing multiple rapid updates

3. **Error handling**: 
   - Log webhook failures for debugging
   - Implement retry logic if needed

## Testing the Webhook

1. **Manual test**: Use the GitHub Actions "Run workflow" button
2. **WordPress test**: 
   - Create or update a post in WordPress
   - Check the Actions tab in your GitHub repository
   - Look for a new workflow run triggered by `repository_dispatch`

## Troubleshooting

### Common Issues:

1. **Webhook not triggering**:
   - Verify the GitHub token has correct permissions
   - Check WordPress error logs
   - Ensure the repository name is correct

2. **Build failures**:
   - Check the Actions logs in GitHub
   - Verify the WordPress API is accessible
   - Ensure the fetch script can connect to your WordPress site

3. **Rate limits**:
   - GitHub API has rate limits (5000/hour for authenticated requests)
   - WordPress.com may have API limits

### Debugging:

- Enable WordPress debug logging: `define('WP_DEBUG_LOG', true);`
- Check logs in `/wp-content/debug.log`
- Monitor GitHub Actions logs for build details

## Alternative Approaches

### Scheduled Rebuilds

If webhooks are too complex, you can rely on the scheduled rebuild (daily at 6 AM UTC) configured in the workflow.

### Manual Rebuilds

Use the "Run workflow" button in GitHub Actions for manual rebuilds when needed.

### RSS/Feed Monitoring

Set up an external service to monitor your WordPress RSS feed and trigger rebuilds when new posts are detected.

## Configuration Summary

To complete the setup, you need:

1. ✅ GitHub repository with the rebuild workflow
2. ✅ GitHub Personal Access Token with `repo` permissions  
3. ✅ WordPress webhook configured (plugin or custom code)
4. ✅ Test the webhook by publishing a post

The workflow will automatically:
- Fetch new data from WordPress
- Update the static JSON file
- Rebuild and deploy the site
- Show the new posts in your photoblog timeline
