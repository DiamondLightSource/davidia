import '@h5web/lib/dist/styles.css';
import { MouseEvent, ReactNode, useRef } from 'react';
import { useClickOutside } from '@react-hookz/web';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  show: boolean;
  onClose: (e: MouseEvent) => void;
  children?: ReactNode;
}

export function Modal(props: ModalProps) {
  const rootRef = useRef(null);

  useClickOutside(rootRef, (e) => {
    e.stopPropagation(); // stop interactions outside modal
  });

  return props.show ? (
    <div ref={rootRef} className={styles.modal}>
      <div
        className={styles.modal_content}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modal_header}>
          <h4 className={styles.modal_title}>
            {props.title}
            <button onClick={props.onClose} className={styles.close_button}>
              X
            </button>
          </h4>
        </div>
        <div className={styles.modal_body}> {props.children} </div>
        <div className={styles.modal_footer}></div>
      </div>
    </div>
  ) : null;
}
