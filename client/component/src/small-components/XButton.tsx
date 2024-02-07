import React from 'react';
import styles from '../selection-components/Modeless.module.css';

export function XButton({
  callback,
}: {
  callback: () => void;
}): React.ReactNode {
  return (
    <button onClick={callback} className={styles.close_button}>
      X
    </button>
  );
}
