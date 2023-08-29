import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HomepageTimeline from '@site/src/components/Timeline';

import styles from './index.module.css';
import { Alert } from '../components/Alert';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className="margin-bottom--lg">
          <Alert type="info">🏗 当前版本为测试版，请谨慎使用，正式版将于 2023年12月31日发布！</Alert>
        </div>
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            快速开始
          </Link>
          <Link className="button button--link button--lg" to="https://github.com/netease/tango">
            查看代码
          </Link>
        </div>
        <div className={styles.heroImageBox}>
          <img
            className={styles.heroImage}
            src="https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/30108642346/b8cf/e86d/ef5a/514d90b722b5d8dc0e18516ed594a07b.png"
            alt="preview"
          />
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
