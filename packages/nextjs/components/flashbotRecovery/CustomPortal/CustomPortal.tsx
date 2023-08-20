import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./customPortal.module.css";
import { createPortal } from "react-dom";
import CloseSvg from "../../../public/assets/flashbotRecovery/close.svg";
import { motion } from "framer-motion";

interface IProps {
  title: string;
  image?: string;
  video?: string;
  description: string;
  button?:{
    text:string,
    action:() => void
  }
}
export const CustomPortal = ({ title, image, video, description, button}: IProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);
  const portalSelector = document.querySelector("#myportal");
  if (!portalSelector) {
    return <></>;
  }

  return mounted
    ? createPortal(
        <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`${styles.modalContainer}`}>
          <div className={`${styles.modal} bg-base-300`}>
            <span className={`${styles.close}`} onClick={() => setMounted(false)}>
              {" "}
              <Image src={CloseSvg} alt={""} />
            </span>
            <div className={`${styles.modalContent}`}>

           
            <h3 className={`${styles.title}`}>{title}</h3>
            {!!image ? <Image className={`${styles.image}`} src={image} alt={""} /> : <></>}
            {!!video ? <video src={video} /> : <></>}
            <p className={`${styles.text} text-secondary-content`}>{description}</p>
            {!!button ? <button className={`${styles.button} btn btn-primary`} onClick={() => button.action()}>{button.text}</button> :<></>}
            </div>
          </div>
        </motion.div>,
        portalSelector,
      )
    : null;
};
