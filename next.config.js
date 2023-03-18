const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});

const nextConfig = {
  images: {
    domains: [
      'i.ytimg.com',
      'media.discordapp.net',
      // Add any other domains you want to allow here
    ],
  },
};

module.exports = withNextra(nextConfig);