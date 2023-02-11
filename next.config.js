const withNextra = require('nextra')({
  // theme: './theme.tsx',
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

module.exports = withNextra()
