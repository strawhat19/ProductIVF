import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
let appName = `ProductIVF`;

const config: DocsThemeConfig = {
  logo: <span>{appName}</span>,
  project: {
    link: 'https://github.com/strawhat19/',
  },
  chat: {
    link: 'https://discord.gg/gv9HnAv',
  },
  docsRepositoryBase: 'https://github.com/strawhat19/ProductIVF/',
  footer: {
    text: appName,
  },
  primaryHue: 154,
  faviconGlyph:	`XX`
}

export default config
