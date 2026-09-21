import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/v1': {
        target: 'https://jt3v2ls2-5000.inc1.devtunnels.ms',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        cookiePathRewrite: '/',
        headers: {
          'X-Tunnel-Skip-Anti-Abuse-Header': 'true',
        },
      },
    },
  },
});
