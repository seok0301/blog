import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://blog-eosin-theta-40.vercel.app',
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
});
