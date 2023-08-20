import React from 'react'
import styles from "./customButton.module.css";

interface IProps{
    text:string;
    onClick:() => void;
    type:"accent"|"primary"
}
export const CustomButton = ({text, onClick, type}:IProps) => {
  return (
    <button className={`${styles.button} btn btn-${type} btn-xs`} onClick={() => onClick()}>{text}</button>
  )
}
