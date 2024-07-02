import { type Aspect, ToggleGroup } from '@h5web/lib';
import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import LabelledInput from './LabelledInput';
import type { IIconType } from './Modal';
import Modal from './Modal';
import styles from './Modal.module.css';
import { getAspectType, isValidPositiveNumber } from './utils';

/**
 * Props for the `AspectConfigModal` component.
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
 * Render the configuration options for the aspect ratio.
 * @param {AspectConfigModalProps} props - The component props.
 * @returns {(React.JSX.Element | null)[]} {Modal} The rendered component.
 */
function AspectConfigModal(
  props: AspectConfigModalProps
): (React.JSX.Element | null)[] {
  const initialAspect = props.aspect;
  const [aspectType, setAspectType] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<number>(1.0);
  const initialType = getAspectType(initialAspect);

  useEffect(() => {
    setAspectType(initialType);
    setAspectRatio(initialType === 'number' ? (initialAspect as number) : 2);
  }, [initialAspect, initialType]);

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
