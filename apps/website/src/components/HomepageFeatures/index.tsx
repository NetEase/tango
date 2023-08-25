import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: '可视化搭建',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>提供通用低代码引擎，支持通过拖拽和配置的方式快捷创建和修改应用，轻松完成模式化应用开发。</>
    ),
  },
  {
    title: '源码驱动',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>低代码引擎底层使用源代码驱动，无私有搭建协议和DSL，支持在线低代码和源码双模式同步开发。</>
    ),
  },
  {
    title: '开箱即用',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        提供开箱即用的低代码设计器组件，支持轻松网关，快捷构建基于低代码引擎的低代码生产力工具。
      </>
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
