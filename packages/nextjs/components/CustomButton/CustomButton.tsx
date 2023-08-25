import React from "react";
import styles from "./customButton.module.css";

interface IProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  type: "btn-accent" | "btn-primary";
}
export const CustomButton = ({ text, onClick, disabled = false, type }: IProps) => {
  return (
    <button disabled={disabled} className={`${styles.button} btn ${type} btn-xs`} onClick={() => onClick()}>
      {text}
    </button>
  );
};
