import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://agus1991.github.io',
  trailingSlash: 'never',
  build: {
    format: 'directory'
  },
  integrations: [
    tailwind({
      applyBaseStyles: false
    }),
    sitemap({
      filter: (page) => !page.includes('/drafts/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date()
    }),
    mdx()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true
    }
  }
});
