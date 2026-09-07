import { fileURLToPath } from "node:url"
import { defineConfig } from "vite-plus"

export default defineConfig({
  fmt: {
    semi: false,
  },
  lint: {
    ignorePatterns: ["dist/**"],
  },
  test: {
    allowOnly: false,
    clearMocks: true,
    restoreMocks: true,
    setupFiles: ["./lib/testing/setup.ts"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./lib", import.meta.url)) },
  },
})
