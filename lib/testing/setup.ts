import { afterEach, beforeEach, vi } from "vite-plus/test"

beforeEach(() => {
  vi.stubGlobal("fetch", () => {
    throw new Error("Unexpected network request: use an explicit HTTP mock in tests")
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})
