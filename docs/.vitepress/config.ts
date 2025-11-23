import { defineConfig } from "vitepress"

export default defineConfig({
  /** https://vitepress.dev/guide/deploy#setting-a-public-base-path */
  base: "/open-notion-client/",
  title: "notion-client",
  description: "Type-safe Notion database client for TypeScript",
  appearance: "force-dark",
  themeConfig: {
    // logo: "https://github.com/interactive-inc.png",
    nav: [
      { text: "Guides", link: "/guides", activeMatch: "/guides/" },
      { text: "API", link: "/modules", activeMatch: "/modules/" },
    ],
    sidebar: [
      {
        text: "Guides",
        items: [
          { text: "Overview", link: "/guides" },
          { text: "Concept", link: "/guides/concept" },
          { text: "Query", link: "/guides/query" },
          { text: "Mutation", link: "/guides/mutation" },
          { text: "Markdown", link: "/guides/markdown" },
        ],
      },
      {
        text: "Design",
        items: [
          { text: "Schema Definition", link: "/design/schema" },
          { text: "Type Safety", link: "/design/type-safe" },
        ],
      },
      {
        text: "API",
        items: [
          { text: "Overview", link: "/modules" },
          { text: "NotionTable", link: "/modules/notion-table" },
          { text: "NotionMarkdown", link: "/modules/enhance" },
          { text: "fromNotionBlocks", link: "/modules/from-blocks" },
          { text: "toNotionBlocks", link: "/modules/to-notion-blocks" },
        ],
      },
      {
        text: "Property Types",
        items: [
          { text: "Overview", link: "/types/" },
          { text: "Title", link: "/types/title" },
          { text: "Select", link: "/types/select" },
          { text: "Multi-Select", link: "/types/multi-select" },
          { text: "Number", link: "/types/number" },
          { text: "Checkbox", link: "/types/checkbox" },
          { text: "Rich Text", link: "/types/rich-text" },
          { text: "Date", link: "/types/date" },
          { text: "Email", link: "/types/email" },
          { text: "URL", link: "/types/url" },
          { text: "Phone Number", link: "/types/phone-number" },
          { text: "People", link: "/types/people" },
          { text: "Files", link: "/types/files" },
          { text: "Relation", link: "/types/relation" },
          { text: "Formula", link: "/types/formula" },
          { text: "Rollup", link: "/types/rollup" },
        ],
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
