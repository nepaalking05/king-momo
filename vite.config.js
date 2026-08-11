import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "logo.png"
      ],

      manifest: {
        name: "Nepal King Momo POS",

        short_name: "KingMomo",

        description:
          "Momo Cart Management System",

        theme_color: "#4b1600",

        background_color: "#ffffff",

        display: "standalone",

        orientation: "portrait",

        start_url: "/",

        icons: [
          {
            src: "/logo-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/logo-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});