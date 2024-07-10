import { type Aspect, ToggleGroup } from '@h5web/lib';
import React, { useEffect, useRef, useState } from 'react';
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
  const { aspect: initAspect, setAspect, children } = props;
  const typeRef = useRef('number');
  const [aspectRatio, setAspectRatio] = useState<number>(2.0);

  useEffect(() => {
    const initType = getAspectType(initAspect);
    console.log('Set initial type', initType, initAspect);
    typeRef.current = initType;
    setAspectRatio(initType === 'number' ? (initAspect as number) : 2.0);
  }, [initAspect]);

  function handleAspectTypeChange(val: string) {
    typeRef.current = val;
    if (val === 'number') {
      setAspect(aspectRatio);
    } else {
      setAspect(val as Aspect);
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
            disabled={typeRef.current !== 'number'}
            label="aspect ratio"
            input={aspectRatio}
            isValid={(v) => isValidPositiveNumber(v, 10)}
            inputAttribs={{
              name: 'digits',
              pattern: '^\\d+|\\d+.\\d*$',
              size: 3,
            }}
            updateValue={(v) => {
              setAspectRatio(v);
              setAspect(v);
            }}
            submitLabel="update ratio"
          />
        </div>
        <div className={styles.aspect}>
          <ToggleGroup
            role="radiogroup"
            ariaLabel="aspect"
            value={typeRef.current}
            onChange={handleAspectTypeChange}
          >
            <ToggleGroup.Btn label="number" value="number" />
            <ToggleGroup.Btn label="auto" value="auto" />
            <ToggleGroup.Btn label="equal" value="equal" />
          </ToggleGroup>
          {children}
        </div>
      </>
    ),
  });
}

export type { AspectConfigModalProps };
export default AspectConfigModal;
