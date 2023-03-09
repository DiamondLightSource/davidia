import { ToggleBtn } from '@h5web/lib';
import { useClickOutside, useKeyboardEvent } from '@react-hookz/web';
import { useRef, useState } from 'react';
import type { ComponentType, ReactNode, SVGAttributes } from 'react';

import styles from './Modal.module.css';

export interface ModalProps {
  title: string;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  button?: ReactNode;
  children?: ReactNode;
}

export function Modal(props: ModalProps) {
  const rootRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  useClickOutside(rootRef, (e) => {
    e.stopPropagation(); // stop interactions outside modal
  });
  useKeyboardEvent('Escape', () => {
    setShowModal(false);
  });

  const toggle = props.button ? (
    <button
      title={props.title}
      className={styles.btn}
      onClick={() => setShowModal(true)}
    >
      {props.button}
    </button>
  ) : (
    <ToggleBtn
      label={props.title}
      icon={props.icon}
      onToggle={() => {
        setShowModal(true);
      }}
      value={false}
    />
  );

  const modal = showModal ? (
    <div hidden={!showModal} ref={rootRef} className={styles.modal}>
      <div
        className={styles.modal_content}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modal_header}>
          <h4 className={styles.modal_title}>
            {props.title}
            <button
              onClick={() => {
                setShowModal(false);
              }}
              className={styles.close_button}
            >
              X
            </button>
          </h4>
        </div>
        <div className={styles.modal_body}> {props.children} </div>
        <div className={styles.modal_footer}></div>
      </div>
    </div>
  ) : null;

  return [modal, toggle];
}
