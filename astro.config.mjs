import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://blog-eosin-theta-40.vercel.app',

  markdown: {
    shikiConfig: { theme: 'github-light' },
  },

  adapter: vercel(),
});