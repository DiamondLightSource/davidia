import { type Aspect, ToggleGroup } from '@h5web/lib';
import { useState } from 'react';
import type { ReactNode } from 'react';

import LabelledInput from '../LabelledInput';
import type { IIconType } from './Modal';
import Modal from './Modal';
import styles from './Modal.module.css';
import { getAspectType, isValidPositiveNumber } from '../utils';

/**
 * The props for the `AspectConfigModal` component.
 * @interface {object} AspectConfigModalProps
 * @member {string} title - The title of the modal and the label on the modal's button.
 * @member {IIconType} [icon] - The icon to display on the modal's button.
 * @member {Aspect} aspect - The current value of the aspect.
 * @member {(value: Aspect) => void} setAspect - The function to update aspect state.
 * @member {ReactNode} [children] - The children to render inside the modal.
 */
interface AspectConfigModalProps {
  /**
   * The title of the modal and the label on the modal's button */
  title: string;
  /**
   * The icon to display on the modal's button (optional) */
  icon?: IIconType;
  /**
   * The current value of the aspect */
  aspect: Aspect;
  /**
   * The function to update aspect state */
  setAspect: (value: Aspect) => void;
  /**
   * The children to render inside the modal (optional) */
  children?: ReactNode;
}

/**
 * Renders the configuration options for the aspect ratio.
 * @param {AspectConfigModalProps} props - The component props.
 * @returns {(JSX.Element | null)[]} {Modal} The rendered component.
 */
function AspectConfigModal(
  props: AspectConfigModalProps
): (JSX.Element | null)[] {
  const initialType = getAspectType(props.aspect);
  const [aspectType, setAspectType] = useState<string>(initialType);
  const [aspectRatio, setAspectRatio] = useState<number>(
    initialType === 'number' ? (props.aspect as number) : 2
  );

  function handleAspectTypeChange(val: string) {
    setAspectType(val);
    if (val === 'number') {
      props.setAspect(aspectRatio);
    } else {
      props.setAspect(val as Aspect);
    }
  }

  return Modal({
    title: props.title,
    icon: props.icon,
    children: (
      <>
        <div className={styles.aspect}>
          <LabelledInput<number>
            key="0"
            disabled={aspectType !== 'number'}
            label="aspect ratio"
            input={aspectRatio}
            isValid={(v) => isValidPositiveNumber(v, 10)}
            inputAttribs={{
              name: 'digits',
              pattern: '^\\d+|\\d+.\\d*$',
              size: 3,
            }}
            updateValue={(v) => {
              props.setAspect(v);
              setAspectRatio(v);
            }}
            submitLabel="update ratio"
          />
        </div>
        <div className={styles.aspect}>
          <ToggleGroup
            role="radiogroup"
            ariaLabel="aspect"
            value={aspectType}
            onChange={handleAspectTypeChange}
          >
            <ToggleGroup.Btn label="number" value="number" />
            <ToggleGroup.Btn label="auto" value="auto" />
            <ToggleGroup.Btn label="equal" value="equal" />
          </ToggleGroup>
          {props.children}
        </div>
      </>
    ),
  });
}

export type { AspectConfigModalProps };
export default AspectConfigModal;
