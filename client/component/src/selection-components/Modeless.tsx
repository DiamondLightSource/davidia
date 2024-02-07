import Draggable, { DraggableEvent } from 'react-draggable';
import { useKeyboardEvent } from '@react-hookz/web';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import styles from './Modeless.module.css';
import { XButton } from '../small-components/XButton';

/**
 *
 * The props for the `Modeless` component.
 * @interface {object} ModalProps
 * @member {string} title - The title of the modeless.
 * @member {ReactNode} [button] - The button to display.
 * @member {boolean} showModeless - If the modeless is shown.
 * @member {(s: boolean) => void} [setShowModeless] - Handles showModeless toggle.
 * @member {ReactNode} [children] - Any child components.
 */
interface ModelessProps {
  title: string;
  button?: ReactNode;
  showModeless: boolean;
  setShowModeless: (s: boolean) => void;
  children?: ReactNode;
}

/**
 *
 * Renders a modeless.
 * @param {ModelessProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function Modeless(props: ModelessProps) {
  const rootRef = useRef(null);
  const [defaultPosition, setDefaultPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  useKeyboardEvent('Escape', () => props.setShowModeless(false));

  const handleStop = (
    _e: DraggableEvent,
    data: { x: number; y: number }
  ): void => {
    setDefaultPosition({ x: data.x, y: data.y });
  };

  if (!props.showModeless) return [];

  return [
    <Draggable
      key={props.title}
      handle="strong"
      defaultPosition={defaultPosition}
      nodeRef={rootRef}
      onStop={handleStop}
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
                <XButton callback={() => props.setShowModeless(false)} />
              </h4>
            </div>
          </strong>
          {/* MAIN BODY */}
          <div className={styles.modeless_body}>{props.children}</div>
          <div className={styles.modeless_footer} />
        </div>
      </div>
    </Draggable>,
  ];
}

export type { ModelessProps };
export default Modeless;
