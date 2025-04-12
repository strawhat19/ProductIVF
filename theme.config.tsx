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

const logo = () => <Logo title={`ProductIVF`} color={`hsl(var(--nextra-primary-hue)100% 50%/1)`} />;
const footer = () => <Footer style={{ minHeight: `fit-content` }} />;

const head = () => {
  return <>
    <link rel={`preconnect`} href={`https://fonts.gstatic.com`} />
    <link rel={`preconnect`} href={`https://fonts.googleapis.com`} />
    <link rel={`icon`} href={`https://next-13-vite-comparison.vercel.app/piratechs.svg`} type={`image/x-icon`} />
    <meta name={`viewport`} content={`width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`} />
  </>
}

const navForm = (headerForm = false) => {
  return (
    <div className={`navFormDiv ${headerForm ? `headerForm` : `nav_Form`}`} style={{ order: -1, display: `flex`, flexDirection: `row`, gridGap: 15, alignItems: `center`, marginRight: 10 }}>
      <Status devOnly={true} style={{ minWidth: 200 }} showTitle={false} />
      <Time />
      <AuthState classes={`navFormText`} nextOverride={AuthStates.Register} hideOnUsersLoading={true} />
      <section className={`navFormSection`} style={{ margin: 0, padding: 0, position: `relative` }}>
        <Form navForm={true} style={{ display: `flex`, flexDirection: `row` }} />
      </section>
    </div>
  )
}

const toc = () => {
  return (
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
  )
}

const setToc = (e) => {
  let toc = document.querySelector(`.nextra-toc`);
  if (toc) {
    toc.classList.toggle(`minimized`);
    toc.classList.contains(`minimized`) ? localStorage.setItem(`tocMinimized`, JSON.stringify(true)) : localStorage.setItem(`tocMinimized`, JSON.stringify(false));
  }
}

const config: DocsThemeConfig = {
  head: head(),
  logo: logo(),
  primaryHue: 195,
  editLink: { text: null },
  feedback: { content: null },
  toc: { extraContent: toc() },
  footer: { component: footer() },
  search: { component: navForm() },
  chat: { link: `https://discord.gg/gv9HnAv` },
  project: { link: `https://github.com/strawhat19/` },
  docsRepositoryBase: `https://github.com/strawhat19/ProductIVF/`,
  useNextSeoProps() { return { titleTemplate: `%s | ProductIVF` } },
}

export default config;