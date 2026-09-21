import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { rewriteDevAuthCookie } from "./config/proxyCookies.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  // A relative production URL can use a separate upstream for local development.
  const upstream = env.VITE_API_PROXY_TARGET || env.VITE_API_URL;
  const apiUrl = new URL(
    upstream?.startsWith("http")
      ? upstream
      : "https://jt3v2ls2-5000.inc1.devtunnels.ms/v1"
  );

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/v1": {
          target: apiUrl.origin,
          rewrite: (path) => path.replace(/^\/v1/, apiUrl.pathname.replace(/\/$/, "")),
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("proxyRes", (response) => {
              const cookies = response.headers["set-cookie"];
              if (cookies) {
                response.headers["set-cookie"] = cookies.map(rewriteDevAuthCookie);
              }
            });
          },
          cookieDomainRewrite: "",
          cookiePathRewrite: "/",
          headers: {
            "X-Tunnel-Skip-Anti-Abuse-Header": "true",
          },
        },
      },
    },
  };
});
