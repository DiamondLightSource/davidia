import Draggable from 'react-draggable';
import { useKeyboardEvent } from '@react-hookz/web';
import { useRef } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';

import styles from './Modeless.module.css';

/**
 * Props for the `Modeless` component.
 */
interface ModelessProps extends PropsWithChildren {
  /** The title of the modeless */
  title: string;
  /** The button to display (optional) */
  button?: ReactNode;
  /** If the modeless is shown */
  showModeless: boolean;
  /** Handles showModeless toggle */
  setShowModeless: (s: boolean) => void;
}

/**
 * Render a modeless.
 * @param {ModelessProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function Modeless(props: ModelessProps) {
  const rootRef = useRef(null);

  useKeyboardEvent('Escape', () => {
    props.setShowModeless(false);
  });

  const modeless = props.showModeless ? (
    <Draggable key={props.title} handle="strong" nodeRef={rootRef}>
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

export type { ModelessProps };
export default Modeless;
