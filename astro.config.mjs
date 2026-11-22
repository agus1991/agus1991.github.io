import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function sitemapCopy() {
  return {
    name: 'sitemap-copy',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const outDir = fileURLToPath(dir);
        const sitemap0 = path.join(outDir, 'sitemap-0.xml');
        const sitemapXml = path.join(outDir, 'sitemap.xml');
        if (fs.existsSync(sitemap0)) {
          fs.copyFileSync(sitemap0, sitemapXml);
          console.log('[sitemap-copy] Successfully copied sitemap-0.xml to sitemap.xml');
        }
      }
    }
  };
}

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
    sitemapCopy(),
    mdx()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true
    }
  }
});
