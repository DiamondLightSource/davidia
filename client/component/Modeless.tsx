import Draggable from 'react-draggable';
import { useClickOutside, useKeyboardEvent } from '@react-hookz/web';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import styles from './Modeless.module.css';

export interface ModelessProps {
  title: string;
  button?: ReactNode;
  showModeless: boolean;
  setShowModeless: (s: boolean) => void;
  children?: ReactNode;
}

export function Modeless(props: ModelessProps) {
  const rootRef = useRef(null);
  const [defaultPosition, setDefaultPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  useClickOutside(rootRef, (e) => {
    e.stopPropagation(); // stop interactions outside modeless
  });
  useKeyboardEvent('Escape', () => {
    props.setShowModeless(false);
  });

  const modeless = props.showModeless ? (
    <Draggable
      handle="strong"
      defaultPosition={defaultPosition}
      onStop={(e, data: { x: number; y: number }) => {
        setDefaultPosition({ x: data.x, y: data.y });
      }}
    >
      <div
        hidden={!props.showModeless}
        ref={rootRef}
        className={styles.modeless}
      >
        <div
          className={styles.modeless_content}
          onClick={(e) => e.stopPropagation()}
        >
          <strong className="cursor">
            <div className={styles.modeless_header}>
              <h4 className={styles.modeless_title}>
                {props.title}
                <button
                  onClick={() => {
                    props.setShowModeless(false);
                  }}
                  className={styles.close_button}
                >
                  X
                </button>
              </h4>
            </div>
          </strong>
          <div className={styles.modeless_body}> {props.children} </div>
          <div className={styles.modeless_footer}></div>
        </div>
      </div>
    </Draggable>
  ) : null;

  return [modeless];
}