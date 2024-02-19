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
          <Link className="button button--primary button--lg" to="/docs/intro">
            {translate({
              id: 'homepage.hero.button.document',
              message: '快速开始',
            })}
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="https://tango-demo.musicfe.com/designer/"
          >
            {translate({ id: 'homepage.hero.button.playground', message: '演示应用' })}
          </Link>
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
