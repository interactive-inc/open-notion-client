import { fileURLToPath } from "node:url"
import { defineConfig } from "vite-plus"

export default defineConfig({
  fmt: {
    semi: false,
  },
  lint: {
    ignorePatterns: ["dist/**"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./lib", import.meta.url)) },
  },
})
