import React from 'react';
import Logo from './components/logo';
import Form from './components/form';
import Quote from './components/qotd';
import Status from './components/status';
import Footer from './components/footer';
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
    // content: null,
    content: `Report a Bug  →`,
  },
  editLink: {
    text: null,
    // text: `Quote goes here`,
    // component: <a className={`hoverLink`} style={{fontSize: 12}} href={`https://github.com/strawhat19/ProductIVF`} target={`_blank`}>Github  →</a> as any,
  },
  // sidebar: {
  //   titleComponent: <Form />
  // },
  navbar: {
    extraContent: <div className={`navFormDiv`} style={{order: -1, display: `flex`, flexDirection: `row`, gridGap: 15, alignItems: `center`}}>
      <span className={`navFormText textOverflow extended`} style={{minWidth: `fit-content`}}>Sign In</span>
      <section className={`navFormSection`} style={{maxWidth: 300, margin: 0, padding: `0 20px 0 0 !important`, position: `relative`}}>
        <Form id="navForm" style={{display: `flex`, flexDirection: `row`}} />
      </section>
    </div>,
  },
  toc: {
    extraContent: <section style={{padding: `0 20px 0 0 !important`, display: `flex`, flexDirection: `column`, margin: 0, order: -2 }}>
      <Status />
      <h2 style={{fontSize: 18, paddingBottom: `.5em`, borderBottom: `1px solid var(--gameBlueSoft)`}}><i>Sign In or Sign Up</i></h2>
      <Form id="sidebarForm" />
      <Quote style={{margin: `20px 0`}} id="sidebarQotd" />
    </section>,
  },
  head: <>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.css"></link>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
  <link rel="icon" href="	https://next-13-vite-comparison.vercel.app/piratechs.svg" type="image/x-icon"></link>
  <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" />
  <script defer src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script defer src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
  {/* <script defer>
      $(`.draggableDiv`).each(function() {
        let any = $(this);
        any.sortable();
      })
  </script> */}
  </>,
  logo: <Logo title={`ProductIVF`} color={`hsl(var(--nextra-primary-hue)100% 50%/1)`} />,
  search: {
    placeholder: `Search...`
  },
  project: {
    link: 'https://github.com/strawhat19/',
  },
  chat: {
    link: 'https://discord.gg/gv9HnAv',
  },
  docsRepositoryBase: 'https://github.com/strawhat19/ProductIVF/',
  footer: {
    component: <Footer style={{margin: `0 5px`}} />
  },
}

export default config
