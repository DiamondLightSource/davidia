import Draggable from 'react-draggable';
import { ToggleBtn } from '@h5web/lib';
import { useClickOutside, useKeyboardEvent } from '@react-hookz/web';
import { useRef, useState } from 'react';
import type { ComponentType, ReactNode, SVGAttributes } from 'react';

import styles from './Modeless.module.css';

export interface ModelessProps {
  title: string;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  button?: ReactNode;
  children?: ReactNode;
}

export function Modeless(props: ModelessProps) {
  const rootRef = useRef(null);
  const [showModeless, setShowModeless] = useState(false);
  const [defaultPosition, setDefaultPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  useClickOutside(rootRef, (e) => {
    e.stopPropagation(); // stop interactions outside modeless
  });
  useKeyboardEvent('Escape', () => {
    setShowModeless(false);
  });

  const toggle = props.button ? (
    <button
      key={props.title}
      title={props.title}
      className={styles.btn}
      onClick={() => setShowModeless(true)}
    >
      {props.button}
    </button>
  ) : (
    <ToggleBtn
      key={props.title}
      label={props.title}
      icon={props.icon}
      onToggle={() => {
        setShowModeless(true);
      }}
      value={false}
    />
  );

  const modeless = showModeless ? (
    <Draggable
      handle="strong"
      defaultPosition={defaultPosition}
      onStop={(e, data: { x: number; y: number }) => {
        setDefaultPosition({ x: data.x, y: data.y });
      }}
    >
      <div hidden={!showModeless} ref={rootRef} className={styles.modeless}>
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
                    setShowModeless(false);
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

  return [modeless, toggle];
}
