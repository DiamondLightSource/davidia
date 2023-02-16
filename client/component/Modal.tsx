import '@h5web/lib/dist/styles.css';
import { ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  show: boolean;
  onClose: (e: React.MouseEvent<HTMLElement>) => void;
  children?: ReactNode;
}

export function Modal(props: ModalProps) {
  if (!props.show) {
    return null;
  }

  return (
    <>
      <div className={styles.modal} onClick={props.onClose}>
        <div
          className={styles.modal_content}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modal_header}>
            <h4 className={styles.modal_title}> {props.title} </h4>
          </div>
          <div className={styles.modal_body}> {props.children} </div>
          <div className={styles.modal_footer}>
            <button onClick={props.onClose} className="button">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
