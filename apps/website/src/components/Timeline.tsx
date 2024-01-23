import React from 'react';
import styles from './index.module.css';
import { translate } from '@docusaurus/Translate';

const timelines = [
  {
    icon: null,
    title: 'Alpha',
    date: '2024.01.31',
    description: translate({
      id: 'homepage.timeline.alpha',
      message: '核心 API 重构完成，文档内容优化',
    }),
  },
  {
    icon: null,
    title: '1.0 RC',
    date: '2024.04.30',
    description: translate({
      id: 'homepage.timeline.rc',
      message: '核心 API 基本稳定，能力完善。',
    }),
  },
  {
    icon: null,
    title: '1.0',
    date: 'Before 2024.12.31',
    description: translate({
      id: 'homepage.timeline.stable',
      message: '1.0 正式版常规迭代',
    }),
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
