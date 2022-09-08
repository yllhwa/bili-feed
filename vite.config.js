import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import monkey, { cdn } from "vite-plugin-monkey";
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig({
  plugins: [
    vue({
      reactivityTransform: true,
    }),
    monkey({
      entry: "src/main.js",
      userscript: {
        icon: "https://static.hdslb.com/images/favicon.ico",
        namespace: "yllhwa.com/bili-feed",
        author: "yllhwa",
        match: ["https://api.bilibili.com/feed"],
        "run-at": "document-start",
        grant: ["GM_xmlhttpRequest"],
        connect: ["*://*.bilibili.com/*", "*://www.mcbbs.net/*"],
      },
      build: {
        // externalGlobals: {
        //   vue: cdn.bootcdn("Vue", "dist/vue.global.prod.js"),
        // },
      },
    }),
    removeConsole(),
  ],
});
