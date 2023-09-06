import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HomepageTimeline from '@site/src/components/Timeline';
import { translate } from '@docusaurus/Translate';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">
          {translate({
            id: 'homepage.hero.title',
            message: siteConfig.title,
          })}
        </h1>
        <p className="hero__subtitle">
          {translate({ id: 'homepage.hero.tagline', message: siteConfig.tagline })}
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="https://tango-demo.musicfe.com/designer/"
          >
            {translate({ id: 'homepage.hero.button.playground', message: '演示应用' })}
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            {translate({
              id: 'homepage.hero.button.document',
              message: '使用文档',
            })}
          </Link>
          <a
            href="https://www.producthunt.com/posts/tango-b8474917-fbce-4180-9fac-4ac7d7a6fa7d?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-tango&#0045;b8474917&#0045;fbce&#0045;4180&#0045;9fac&#0045;4ac7d7a6fa7d"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=412854&theme=light"
              alt="Tango - A&#0032;source&#0032;code&#0032;based&#0032;low&#0045;code&#0032;builder | Product Hunt"
              width="250px"
              height="54px"
            />
          </a>
        </div>
        <div className={styles.heroImageBox}>
          <img
            className={styles.heroImage}
            src="https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/30108642346/b8cf/e86d/ef5a/514d90b722b5d8dc0e18516ed594a07b.png"
            alt="preview"
          />
          d
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageTimeline />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
