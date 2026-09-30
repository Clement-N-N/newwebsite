// @ts-check
import { defineConfig } from 'astro/config';

// The production domain has not been confirmed yet. Set `site` once it is,
// so canonical URLs and sitemaps can be generated.
export default defineConfig({
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  devToolbar: {
    enabled: false,
  },
});
