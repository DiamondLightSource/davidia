import { ToggleGroup } from '@h5web/lib';
import { useState } from 'react';
import type { ComponentType, ReactNode, SVGAttributes } from 'react';

import { LabelledInput } from './LabelledInput';
import { Modal } from './Modal';
import styles from './Modal.module.css';
import { getAspectType, isValidPositiveNumber } from './utils';

interface AspectConfigModalProps {
  title: string;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  aspect: Aspect;
  setAspect: (value: Aspect) => void;
  children?: ReactNode;
}

export function AspectConfigModal(props: AspectConfigModalProps) {
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
