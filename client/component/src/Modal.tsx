import Draggable from 'react-draggable';
import { ToggleBtn } from '@h5web/lib';
import { useClickOutside, useKeyboardEvent } from '@react-hookz/web';
import { Fragment, useRef, useState } from 'react';
import type {
  ComponentType,
  PropsWithChildren,
  ReactNode,
  RefObject,
} from 'react';

import styles from './Modal.module.css';

type IIconType = ComponentType<{ className: string }>;

/**
 * Props for the `Modal` component.
 */
interface ModalProps {
  /** The title of the modal */
  title: string;
  /** The icon to display (optional) */
  icon?: IIconType;
  /** The button to display (optional) */
  button?: ReactNode;
  /** If true, hide toggle */
  hideToggle?: boolean;
}

/**
 * Render a modal component.
 * @param {ModalProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function Modal(props: PropsWithChildren<ModalProps>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);

  useClickOutside(rootRef, (e) => {
    e.stopPropagation(); // stop interactions outside modal
  });
  useKeyboardEvent('Escape', () => {
    setShowModal(false);
  });

  const toggleTitle = props.title;
  const toggleKey = toggleTitle + '-toggle';
  const toggleHidden = props.hideToggle ?? false;
  const toggle = props.button ? (
    <button
      key={toggleKey}
      title={toggleTitle}
      className={styles.btn}
      onClick={() => setShowModal(true)}
      hidden={toggleHidden}
    >
      {props.button}
    </button>
  ) : (
    <ToggleBtn
      key={toggleKey}
      label={toggleTitle}
      Icon={props.icon}
      onToggle={() => {
        setShowModal(true);
      }}
      value={false}
      hidden={toggleHidden}
    />
  );

  return (
    <Fragment key={'Modal-' + toggleTitle}>
      {!toggleHidden && toggle}
      {showModal && (
        <Draggable
          key={toggleTitle}
          handle="strong"
          nodeRef={rootRef as RefObject<HTMLElement>}
        >
          <div hidden={!showModal} className={styles.modal} ref={rootRef}>
            <div
              className={styles.modal_content}
              onClick={(e) => e.stopPropagation()}
            >
              <strong className="cursor">
                <div className={styles.modal_header}>
                  <h4 className={styles.modal_title}>
                    {toggleTitle}
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
              </strong>
              <div className={styles.modal_body}> {props.children} </div>
              <div className={styles.modal_footer}></div>
            </div>
          </div>
        </Draggable>
      )}
    </Fragment>
  );
}

export type { IIconType, ModalProps };
export default Modal;
