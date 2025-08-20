# lodelnico.com – Personal Photoblog

This is the source code for my personal photoblog [lodelnico.com](https://lodelnico.com), built with **Astro** and deployed to my self-hosted Apache server on Debian.

## 🚀 Tech Stack

- **[Astro](https://astro.build/)** – Static site generator with excellent performance
- **TypeScript** – Type safety and better development experience  
- **GitHub Actions** – CI/CD pipeline for automated deployment
- **Apache on Debian** – Self-hosted web server at `/var/www/lodelnico`
- **rsync/SSH** – Secure deployment method

## 📸 Features

- **Responsive photo gallery** with lazy loading and lightbox functionality
- **Image optimization** with multiple sizes and WebP support
- **SEO optimized** with proper meta tags, sitemap, and structured data
- **Performance focused** with minimal JavaScript and optimal loading
- **Mobile-first design** that works great on all devices
- **Category filtering** for organizing different types of photography

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/lodelnico.git
cd lodelnico

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run preview` – Preview production build locally
- `npm run check` – Run Astro and TypeScript checks

## 🚀 Deployment

### Automatic Deployment

The site automatically deploys when you push to the `main` branch using GitHub Actions.

### Required GitHub Secrets

Set up these secrets in your GitHub repository settings:

```bash
SSH_PRIVATE_KEY  # Your private SSH key for server access
SSH_HOST         # Your server hostname/IP (e.g., your-server.com)
SSH_USER         # SSH username (e.g., www-data or your-user)
```

### Manual Deployment

You can also trigger deployment manually:

1. Go to the "Actions" tab in your GitHub repository
2. Select "Build and Deploy Photoblog" 
3. Click "Run workflow"

### Server Requirements

- Apache web server
- SSH access with key-based authentication
- Directory `/var/www/lodelnico` with proper permissions

## 📁 Project Structure

```
/
├── public/              # Static assets
│   ├── images/         # Photo gallery images
│   ├── favicon.svg     # Site favicon
│   └── robots.txt      # SEO robots file
├── src/
│   ├── components/     # Reusable Astro components
│   │   ├── Hero.astro
│   │   └── PhotoGrid.astro
│   ├── layouts/        # Page layouts
│   │   └── BaseLayout.astro
│   ├── pages/          # Site pages (file-based routing)
│   │   ├── index.astro
│   │   ├── gallery.astro
│   │   └── about.astro
│   ├── styles/         # Global CSS styles
│   │   └── global.css
│   └── utils/          # Utility functions
│       └── photo-utils.ts
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions deployment
├── astro.config.mjs    # Astro configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## 📷 Adding Photos

1. **Add images** to `/public/images/gallery/` 
2. **Update the photo data** in `/src/components/PhotoGrid.astro`
3. **Commit and push** – the site will auto-deploy

### Image Guidelines

- **Format**: JPG or WebP recommended
- **Size**: Max 1MB per image for web performance
- **Dimensions**: 1200x800px or similar aspect ratio for consistency
- **Naming**: Use descriptive filenames (e.g., `sunset-beach-2024.jpg`)

## 🎨 Customization

### Colors and Styling

Edit CSS custom properties in `/src/styles/global.css`:

```css
:root {
  --color-background: #fafafa;
  --color-text: #1a1a1a;
  --color-accent: #0066cc;
  /* ... more variables */
}
```

### Photo Categories

Add new categories in `/src/utils/photo-utils.ts`:

```typescript
const colors: { [key: string]: string } = {
  landscape: '#4ade80',
  portrait: '#f59e0b',
  yournewcategory: '#your-color',
  // ...
};
```

## 🔧 Troubleshooting

### Deployment Issues

- **SSH connection fails**: Check your SSH key and server credentials
- **Permission denied**: Ensure `/var/www/lodelnico` has correct permissions
- **Build fails**: Run `npm run check` locally to identify TypeScript issues

### Development Issues

- **Port 3000 in use**: Change port in `astro.config.mjs`
- **Images not loading**: Ensure images are in `/public/images/`
- **TypeScript errors**: Check imports and type definitions

## 📝 License

This project is for personal use. Feel free to get inspired by the code structure, but please don't copy content or images.

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome! Feel free to open an issue or pull request.

---

Built with ❤️ using [Astro](https://astro.build/)
