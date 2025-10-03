// next.config.js  (CJS)

const nextra = require('nextra').default || require('nextra')
const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

const nextPWA = require('next-pwa').default || require('next-pwa')
const withPWA = nextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  fallbacks: { document: '/_offline' },
  runtimeCaching: [
    {
      urlPattern: ({ sameOrigin, request }) =>
        sameOrigin && request.destination === 'document',
      handler: 'NetworkFirst',
      options: { cacheName: 'html-docs', expiration: { maxEntries: 64, maxAgeSeconds: 7 * 24 * 60 * 60 } }
    },
    {
      urlPattern: ({ sameOrigin, request }) =>
        sameOrigin && ['script', 'style'].includes(request.destination),
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'static-assets', expiration: { maxEntries: 128, maxAgeSeconds: 30 * 24 * 60 * 60 } }
    },
    {
      urlPattern: ({ sameOrigin, request }) =>
        sameOrigin && request.destination === 'image',
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'images', expiration: { maxEntries: 256, maxAgeSeconds: 30 * 24 * 60 * 60 } }
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'google-fonts', expiration: { maxEntries: 64, maxAgeSeconds: 365 * 24 * 60 * 60 } }
    }
  ]
})

const routes = {
  settings: { redirects: ['config','general'], icons: { fontAwesome: 'fa-cog', mui: 'Settings' } },
  gallery: { redirects: ['pictures','images'], icons: { fontAwesome: 'fa-images', mui: 'PremMedia' } },
  messages: { redirects: ['chat','chats','message'], icons: { fontAwesome: 'fa-paper-plane', mui: 'Chat' } },
  notifications: { redirects: ['alerts','notification'], icons: { fontAwesome: 'fa-bell', mui: 'Notifications' } },
  projects: { redirects: ['apps','featured','applications','repositories'], icons: { fontAwesome: 'fa-user', mui: 'Person' } },
  board: { redirects: ['items','tasks','lists','list'], icons: { fontAwesome: 'fa-list-check', mui: 'Checklist' } },
  profile: { redirects: ['edit','account','preferences','account'], icons: { fontAwesome: 'fa-user', mui: 'Person' } },
  events: { redirects: ['event','schedule','calendar','booking'], icons: { fontAwesome: 'fa-paint-brush', mui: 'Brush' } },
  signin: { redirects: ['log','sign','login','log-in','sign-in'], icons: { fontAwesome: 'fa-sign-in-alt', mui: 'Login' } },
  signup: { redirects: ['new','sign-up','register','subscribe'], icons: { fontAwesome: 'fa-user-plus', mui: 'PersonAdd' } },
  styles: { redirects: ['theme','design','components','typography'], icons: { fontAwesome: 'fa-paint-brush', mui: 'Brush' } },
  stocks: { redirects: ['investing','invest','portfolio','stock','holdings'], icons: { fontAwesome: 'fa-info-circle', mui: 'Info' } },
  about: { redirects: ['info','aboutus','company','aboutme','about-us','about-me'], icons: { fontAwesome: 'fa-info-circle', mui: 'Info' } },
  contact: { redirects: ['contactme','contactus','getintouch','get-in-touch','contact-me'], icons: { fontAwesome: 'fa-envelope', mui: 'Mail' } },
}

const nextConfig = {
  reactStrictMode: true,
  images: { domains: ['i.ytimg.com', 'media.discordapp.net'] },
  async redirects() {
    return Object.entries(routes).flatMap(([key, route]) =>
      route.redirects.map(alias => ({
        source: `/${alias}`,
        destination: `/${key}`,
        permanent: true
      }))
    )
  }
}

module.exports = withPWA(withNextra(nextConfig))