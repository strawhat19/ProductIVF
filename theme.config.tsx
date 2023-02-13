import React from 'react';
import Logo from './components/logo';
import { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  // primaryHue: 75, // Yellow
  // primaryHue: 155, // Soft Green
  // primaryHue: 100, // Neon Green
  // primaryHue: 285, // Pink Purple
  primaryHue: 195, // Sky Blue
  useNextSeoProps() {
    return {
      titleTemplate: `%s | ProductIVF`
    }
  },
  feedback: {
    content: null,
    // content: <>form</>,
  },
  editLink: {
    text: null,
    // text: `Quote goes here`,
    // component: <>to</> as any,
  },
  // sidebar: {
  //   titleComponent: <>Yo</>
  // },
  // toc: {
  //   extraContent: <>Hello</>,
  // },
  // navbar: {
  //   extraContent: <>Hello</>,
  // },
  head: <link rel="icon" href="	https://next-13-vite-comparison.vercel.app/piratechs.svg" type="image/x-icon"></link>,
  logo: <Logo title={`ProductIVF`} color={`hsl(var(--nextra-primary-hue)100% 50%/1)`} />,
  search: {
    placeholder: `Search...`
  },
   // faviconGlyph:	`Pr`,
  project: {
    link: 'https://github.com/strawhat19/',
  },
  chat: {
    link: 'https://discord.gg/gv9HnAv',
  },
  docsRepositoryBase: 'https://github.com/strawhat19/ProductIVF/',
  footer: {
    text: `ProductIVF Copyright Ⓒ 2023`,
  },
}

export default config
