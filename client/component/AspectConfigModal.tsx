import '@h5web/lib/dist/styles.css';
import { ReactNode } from 'react';
import { ToggleGroup } from '@h5web/lib';

import styles from './Modal.module.css';
import { LabelledInput } from './LabelledInput';
import { Modal } from './Modal';
import { isValidPositiveNumber } from './utils';

interface AspectConfigModal {
  title: string;
  show: boolean;
  onClose: (e: React.MouseEvent<HTMLElement>) => void;
  aspect: Aspect;
  setAspect: (value: Aspect) => void;
  aspectType: string;
  setAspectType: (value: string) => void;
  aspectRatio: number;
  setAspectRatio: (value: number) => void;
  children?: ReactNode;
}

export function AspectConfigModal(props: AspectConfigModal) {
  if (!props.show) {
    return null;
  }

  function handleAspectTypeChange(val: string) {
    props.setAspectType(val);
    if (val === 'number') {
      props.setAspect(props.aspectRatio);
    } else {
      props.setAspect(val as Aspect);
    }
  }

  return (
    <Modal title={props.title} show={props.show} onClose={props.onClose}>
      <div className={styles.aspect}>
        <LabelledInput<number>
          key="0"
          disabled={props.aspectType !== 'number'}
          label="aspect ratio"
          input={props.aspectRatio}
          isValid={(v) => isValidPositiveNumber(v, 10)}
          inputAttribs={{
            name: 'digits',
            pattern: '^\\d+|\\d+.\\d*$',
            size: 3,
          }}
          updateValue={(v) => {
            props.setAspect(v);
            props.setAspectRatio(v);
          }}
          submitLabel="update ratio"
        />
      </div>
      <div className={styles.aspect}>
        <ToggleGroup
          role="radiogroup"
          ariaLabel="aspect"
          value={props.aspectType}
          onChange={handleAspectTypeChange}
        >
          <ToggleGroup.Btn label="number" value="number" />
          <ToggleGroup.Btn label="auto" value="auto" />
          <ToggleGroup.Btn label="equal" value="equal" />
        </ToggleGroup>
        {props.children}
      </div>
    </Modal>
  );
}
