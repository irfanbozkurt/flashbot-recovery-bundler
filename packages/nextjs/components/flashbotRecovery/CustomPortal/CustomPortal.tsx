import { useEffect, useState } from "react";
import Image from "next/image";
import CloseSvg from "../../../public/assets/flashbotRecovery/close.svg";
import { CustomButton } from "../CustomButton/CustomButton";
import styles from "./customPortal.module.css";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

interface IProps {
  title: string;
  image?: string;
  video?: string;
  close?:() => void;
  description: string;
  button?: {
    text: string;
    disabled:boolean;
    action: () => void;
  };
}
export const CustomPortal = ({ title, image, video, description, button, close}: IProps) => {
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
          className={`${styles.modalContainer}`}
        >
          <div className={`${styles.modal} bg-base-300`}>
            <span className={`${styles.close}`} onClick={() => setMounted(false)}>
              {" "}
              {!!close ? <Image src={CloseSvg} alt={""} onClick={() => close()}/>: <></>}
            </span>
            <div className={`${styles.modalContent}`}>
              <h3 className={`${styles.title}`}>{title}</h3>
              {!!image ? <Image className={`${styles.image}`} src={image} alt={""} /> : <></>}
              {!!video ? <video src={video} /> : <></>}
              <p className={`${styles.text} text-secondary-content`}>{description}</p>
              {!!button ? <CustomButton type="btn-primary" disabled={button.disabled} text={button.text} onClick={() => button.action()} /> : <></>}
            </div>
          </div>
        </motion.div>,
        portalSelector,
      )
    : null;
};
