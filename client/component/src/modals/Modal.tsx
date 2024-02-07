import Draggable from 'react-draggable';
import { ToggleBtn } from '@h5web/lib';
import { useClickOutside, useKeyboardEvent } from '@react-hookz/web';
import { useRef, useState } from 'react';
import type { ComponentType, ReactNode, SVGAttributes } from 'react';

import styles from './Modal.module.css';
import { XButton } from '../small-components/XButton';

type IIconType = ComponentType<SVGAttributes<SVGElement>>;

/**
 * The props for the `Modal` component.
 * @interface {object} ModalProps
 * @member {string} title - The title of the modal.
 * @member {IIcontype} [icon] - The icon to display.
 * @member {ReactNode} [button] - The button to display.
 * @member {ReactNode} [children] - Any child components.
 */
interface ModalProps {
  /** The title of the modal */
  title: string;
  /** The icon to display (optional) */
  icon?: IIconType;
  /** The button to display (optional) */
  button?: ReactNode;
  /** Any child components (optional) */
  children?: ReactNode;
}

/**
 *
 * Renders a modal component.
 * @param {ModalProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function Modal(props: ModalProps) {
  const rootRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [defaultPosition, setDefaultPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  useClickOutside(rootRef, (e) => {
    e.stopPropagation(); // stop interactions outside modal
  });
  useKeyboardEvent('Escape', () => {
    setShowModal(false);
  });

  const toggleTitle = props.title;
  const toggleKey = toggleTitle + '-toggle';
  const toggle = props.button ? (
    <button
      key={toggleKey}
      title={toggleTitle}
      className={styles.btn}
      onClick={() => setShowModal(true)}
    >
      {props.button}
    </button>
  ) : (
    <ToggleBtn
      key={toggleKey}
      label={toggleTitle}
      icon={props.icon}
      onToggle={() => {
        setShowModal(true);
      }}
      value={false}
    />
  );

  const modal = showModal ? (
    <Draggable
      key={toggleTitle}
      handle="strong"
      defaultPosition={defaultPosition}
      nodeRef={rootRef}
      onStop={(_e, data: { x: number; y: number }) => {
        setDefaultPosition({ x: data.x, y: data.y });
      }}
    >
      <div hidden={!showModal} ref={rootRef} className={styles.modal}>
        <div
          className={styles.modal_content}
          onClick={(e) => e.stopPropagation()}
        >
          <strong className="cursor">
            <div className={styles.modal_header}>
              <h4 className={styles.modal_title}>
                {toggleTitle}
                <XButton callback={() => setShowModal(false)} />
              </h4>
            </div>
          </strong>
          <div className={styles.modal_body}> {props.children} </div>
          <div className={styles.modal_footer}></div>
        </div>
      </div>
    </Draggable>
  ) : null;

  return [modal, toggle];
}

export type { IIconType, ModalProps };
export default Modal;
