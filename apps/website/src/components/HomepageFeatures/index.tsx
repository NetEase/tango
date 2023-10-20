import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import Translate, { translate } from '@docusaurus/Translate';

interface FeatureItem {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
}

const FeatureList: FeatureItem[] = [
  {
    title: translate({ id: 'homepage.features.code-driven', message: '源码驱动' }),
    Svg: require('@site/static/img/html-d.svg').default,
    description: (
      <Translate id="homepage.features.code-driven-content">
        基于项目源码提供低代码能力，提供源码级的自定义扩展能力
      </Translate>
    ),
  },
  {
    title: translate({ id: 'homepage.features.low-code', message: '实时出码' }),
    Svg: require('@site/static/img/digital-content-4.svg').default,
    description: (
      <Translate id="homepage.features.low-code-content">
        源码进，源码出，可视化和源码自由切换
      </Translate>
    ),
  },
  {
    title: translate({ id: 'homepage.features.outbox', message: '开箱即用' }),
    Svg: require('@site/static/img/cpu-f.svg').default,
    description: (
      <Translate id="homepage.features.outbox-content">
        提供灵活易用的设计器框架，支持开发者自由扩展封装
      </Translate>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
