import React from 'react';
import styles from './index.module.css';

const timelines = [
  {
    icon: null,
    title: 'Alpha',
    date: '2023.08.30',
    description: '开源仓库和文档站点上线，发布 alpha 演示版本。',
  },
  {
    icon: null,
    title: 'Beta',
    date: '2023.09.30',
    description: '核心 API 面向社区场景重构和优化，发布 Beta 测试版本。',
  },
  {
    icon: null,
    title: '1.0 RC',
    date: '2023.10.30',
    description: '核心 API 基本稳定，不再发生 BR，发布 1.0 RC 版本。',
  },
  {
    icon: null,
    title: '1.0',
    date: 'Before 2023.12.25',
    description: 'API 完全稳定，提供良好的社区支持，可用于生产环境。',
  },
];

export default function HomepageTimeline() {
  return <Timeline items={timelines} />;
}

export interface TimelineProps {
  items: TimelineItemProps[];
}

export function Timeline({ items = [] }: TimelineProps) {
  return (
    <div className={styles.homepageSection}>
      <div className="container">
        <div className={styles.homepageSectionTitle}>Timelines</div>
        <div className="row">
          {items.map((item) => (
            <TimelineItem key={item.date} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  icon: React.ReactNode;
  title: string;
  date: string;
  description?: string;
}

function TimelineItem({ icon, title, date, description }: TimelineItemProps) {
  return (
    <div className="col">
      <div className={styles.timelineItemStyle}>
        <div className={styles.timelineDot}>{icon}</div>
        <div className={styles.timelineLine} />
      </div>
      <div className="margin-top--md">
        <h3>{title}</h3>
        <time>{date}</time>
        <p>{description}</p>
      </div>
    </div>
  );
}
