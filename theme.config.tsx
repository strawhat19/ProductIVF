import React from 'react';
import Logo from './components/logo';
import Form from './components/form';
import { DocsThemeConfig } from 'nextra-theme-docs';
import Footer from './components/footer';
import Section from './components/section';
import Quote from './components/qotd';

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
  //   titleComponent: <Form />
  // },
  navbar: {
    extraContent: <section className={`navFormSection`} style={{maxWidth: 500, margin: 0, paddingRight: 20}}><Form id="navForm" style={{display: `grid`, gridTemplateColumns: `75% 25%`}} /></section>,
  },
  toc: {
    extraContent: <section style={{paddingRight: 20, display: `flex`, flexDirection: `column`}}>
      <Quote style={{marginBottom: 20}} id="sidebarQotd" />
      <Form id="sidebarForm" />
    </section>,
  },
  head: <><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.css"></link>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
  <link rel="icon" href="	https://next-13-vite-comparison.vercel.app/piratechs.svg" type="image/x-icon"></link>
  <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" />
  {/* <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" defer> */}
  </>,
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
    // text: `ProductIVF Copyright Ⓒ 2023`,
    component: <Footer style={{margin: `0 5px`}} />
  },
}

export default config
