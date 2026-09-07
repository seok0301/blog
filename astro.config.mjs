import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://example.com', // 배포 후 실제 주소로
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
});
