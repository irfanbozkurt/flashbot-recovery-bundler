import { useState } from "react";
import styles from "./tabs.module.css";

interface IProps {
  children: (active: number) => any;
  tabTitles: string[];
}

export const Tabs = ({ children, tabTitles }: IProps) => {
  const [active, setActive] = useState(0);

  return (
    <div className={styles.tabsContainer}>
      <div className={`${styles.tabsHeader} bg-base-100`}>
        {tabTitles.map((title, i) => (
          <span
            key={i}
            onClick={() => setActive(i)}
            className={`${styles.tabTitle} ${active !== i ? "text-secondary-content" : "text-secondary bg-neutral"}`}
          >
            {title}
          </span>
        ))}
      </div>
      <div className={styles.tabContent}>
        <>{children(active)}</>
      </div>
    </div>
  );
};
