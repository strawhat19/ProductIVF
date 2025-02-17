// /** @type {import('next').NextConfig} */
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
// });

const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});

const nextConfig = {
  images: {
    domains: [
      'i.ytimg.com',
      'media.discordapp.net',
    ],
  },
  // async rewrites() {
  //   return [
  //     { source: `/about`, destination: `/pages/about` },
  //     { source: `/signin`, destination: `/pages/signin` },
  //     { source: `/signup`, destination: `/pages/signup` },
  //     { source: `/contact`, destination: `/pages/contact` },
  //     { source: `/profile`, destination: `/pages/profile` },
  //     { source: `/settings`, destination: `/pages/settings` },
  //     { source: `/notifications`, destination: `/pages/notifications` },
  //   ];
  // },
  async redirects() {
    return [
      // Sign In
      { source: `/log`, destination: `/signin`, permanent: true },
      { source: `/sign`, destination: `/signin`, permanent: true },
      { source: `/login`, destination: `/signin`, permanent: true },
      { source: `/log-in`, destination: `/signin`, permanent: true },
      { source: `/sign-in`, destination: `/signin`, permanent: true },
      // Sign Up
      { source: `/sign-up`, destination: `/signup`, permanent: true },
      { source: `/register`, destination: `/signup`, permanent: true },
      { source: `/subscribe`, destination: `/signup`, permanent: true },
      // Profile
      { source: `/edit`, destination: `/profile`, permanent: true },
      { source: `/account`, destination: `/profile`, permanent: true },
      { source: `/preferences`, destination: `/profile`, permanent: true },
      // Settings
      { source: `/config`, destination: `/settings`, permanent: true },
      { source: `/general`, destination: `/settings`, permanent: true },
      // Notifications
      { source: `/alerts`, destination: `/notifications`, permanent: true },
      { source: `/notification`, destination: `/notifications`, permanent: true },
      // About
      { source: `/info`, destination: `/about`, permanent: true },
      { source: `/aboutus`, destination: `/about`, permanent: true },
      { source: `/aboutme`, destination: `/about`, permanent: true },
      { source: `/company`, destination: `/about`, permanent: true },
      { source: `/about-us`, destination: `/about`, permanent: true },
      { source: `/about-me`, destination: `/about`, permanent: true },
      { source: `/portfolio`, destination: `/about`, permanent: true },
      // Contact
      { source: `/messages`, destination: `/contact`, permanent: true },
      { source: `/contactus`, destination: `/contact`, permanent: true },
      { source: `/contactme`, destination: `/contact`, permanent: true },
      { source: `/contact-us`, destination: `/contact`, permanent: true },
      { source: `/contact-me`, destination: `/contact`, permanent: true },
      { source: `/getintouch`, destination: `/contact`, permanent: true },
      { source: `/get-in-touch`, destination: `/contact`, permanent: true },
    ];
  }
};

module.exports = withNextra(nextConfig);