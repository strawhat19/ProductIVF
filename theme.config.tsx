import React from 'react';
import Logo from './components/logo';
import Time from './components/time';
import Form from './components/form';
import Quote from './components/qotd';
import Status from './components/status';
import Footer from './components/footer';
import AuthState from './components/auth-state';
import { AuthStates } from './shared/types/types';
import { DocsThemeConfig } from 'nextra-theme-docs';

const setToc = (e) => {
  let toc = document.querySelector(`.nextra-toc`);
  if (toc) {
    toc.classList.toggle(`minimized`);
    toc.classList.contains(`minimized`) ? localStorage.setItem(`tocMinimized`, JSON.stringify(true)) : localStorage.setItem(`tocMinimized`, JSON.stringify(false));
  }
}

const navForm = (headerForm = false) => {
  return (
    <div className={`navFormDiv ${headerForm ? `headerForm` : `nav_Form`}`} style={{order: -1, display: `flex`, flexDirection: `row`, gridGap: 15, alignItems: `center`, marginRight: 10}}>
      <Status devOnly={true} style={{ minWidth: 200 }} showTitle={false} />
      <Time />
      <AuthState classes={`navFormText`} nextOverride={AuthStates.Register} hideOnUsersLoading={true} />
      <section className={`navFormSection`} style={{margin: 0, padding: 0, position: `relative`}}>
        <Form navForm={true} style={{display: `flex`, flexDirection: `row`}} />
      </section>
    </div>
  )
}

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
    // content: `Report a Bug  →`,
  },
  editLink: {
    text: null,
    // component: <SidebarLink children={<a>hello</a>} />,
    // component: <EditLink href={`https://piratechs.com/`} children={<a>Hello</a> as any} />,
  },
  // sidebar: {
  //   titleComponent: <Form />
  // },
  navbar: {
    // extraContent: navForm(),
  },
  toc: {
    // float: true,
    // component: null,
    extraContent: (
      <section id={`tocSection`} style={{padding: `0 20px 0 0 !important`, display: `flex`, flexDirection: `column`, margin: 0, order: -2 }}>
        <Status />
        <h2 style={{fontSize: 18, paddingBottom: `.5em`, borderBottom: `1px solid var(--gameBlueSoft)`}}>
          <i>Sign In or Sign Up</i>
        </h2>
        <Form id={`sidebarForm`} />
        <Quote style={{margin: `20px 0`}} id={`sidebarQotd`} />
        <button id={`minimizeTOCButton`} onClick={(e) => setToc(e)} className={`iconButton`}>
          <span>{`>`}</span>
        </button>
      </section>
    ),
  },
  head: <>
    <link rel={`preconnect`} href={`https://fonts.gstatic.com`} />
    <link rel={`preconnect`} href={`https://fonts.googleapis.com`} />
    <meta name={`viewport`} content={`width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`} />
    <link rel={`icon`} href={`https://next-13-vite-comparison.vercel.app/piratechs.svg`} type={`image/x-icon`}></link>
  </>,
  logo: <Logo title={`ProductIVF`} color={`hsl(var(--nextra-primary-hue)100% 50%/1)`} />,
  search: {
    component: navForm(),
    // placeholder: `Search...`,
  },
  project: {
    link: `https://github.com/strawhat19/`,
  },
  chat: {
    link: `https://discord.gg/gv9HnAv`,
  },
  docsRepositoryBase: `https://github.com/strawhat19/ProductIVF/`,
  footer: {
    component: <Footer style={{ minHeight: `fit-content` }} />
  },
}

export default config;