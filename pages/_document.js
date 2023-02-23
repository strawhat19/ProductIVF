import Document, { Html, Head, Main, NextScript } from 'next/document';
import { AnimatePresence, motion } from 'framer-motion';
import { generateUniqueID } from './_app';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => <App {...props} />,
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
          </>
        ),
      };
    } finally {
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.css" />
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
        </Head>
        <body id={`ProductIVF`}>
          <Main />
          <NextScript />
        </body>
        {/* <AnimatePresence mode={`wait`}>
          <motion.body id={`ProductIVF`} key={generateUniqueID()} initial="pageInitial" animate="pageAnimate" exit="pageExit" transition={{ duration: 0.75 }} variants={{
            pageInitial: {
              opacity: 0,
              clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
            },
            pageAnimate: {
              opacity: 1,
              clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
            },
            pageExit: {
              opacity: 0,
              clipPath: `polygon(50% 0, 50% 0, 50% 100%, 50% 100%)`,
            },
          }}>
            <Main />
            <NextScript />
          </motion.body>
        </AnimatePresence> */}
      </Html>
    );
  }
}
