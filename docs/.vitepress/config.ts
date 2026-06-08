import { defineConfig } from "vitepress"

export default defineConfig({
  /** https://vitepress.dev/guide/deploy#setting-a-public-base-path */
  base: "/open-notion-client/",
  title: "notion-client",
  description: "Type-safe Notion database client for TypeScript",
  appearance: "force-dark",
  themeConfig: {
    nav: [
      { text: "Guides", link: "/guides", activeMatch: "/guides/" },
      { text: "API", link: "/modules", activeMatch: "/modules/" },
    ],
    sidebar: [
      {
        text: "Guides",
        items: [
          { text: "Getting Started", link: "/guides" },
          { text: "Query", link: "/guides/query" },
          { text: "Mutation", link: "/guides/mutation" },
          { text: "Markdown", link: "/guides/markdown" },
        ],
      },
      {
        text: "API",
        items: [{ text: "Reference", link: "/modules" }],
      },
      {
        text: "Property Types",
        items: [{ text: "Reference", link: "/types/" }],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/interactive-inc/open-notion-client",
      },
    ],
    search: {
      provider: "local",
    },
    footer: {
      message: "MIT License.",
      copyright: "© 2025-present Interactive Inc.",
    },
  },
})
