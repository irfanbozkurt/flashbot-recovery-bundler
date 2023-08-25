import styles from "./sidebar.module.css";
import { BundlingSteps } from "~~/types/enums";

interface IStepProps {
  index: BundlingSteps;
  activeStep: BundlingSteps;
  title: string;
  description: string;
}
export const SideBarStepInfo = ({ index, activeStep, title, description }: IStepProps) => {
  const isActive = index == activeStep;
  const isCompleted = activeStep > index;

  return (
    <div
      className={`${styles.step} ${isCompleted ? styles.completed : ""} ${isActive ? "" : "text-secondary-content"}`}
    >
      <div>
        <span className={`${styles.badge} ${isActive ? "btn-primary" : ""}`}>{index}</span>
      </div>
      <div className={styles.stepContainer}>
        <h2 className={styles.stepTitle}>{title}</h2>
        <p className={styles.stepDescription}>{description}</p>
      </div>
    </div>
  );
};
