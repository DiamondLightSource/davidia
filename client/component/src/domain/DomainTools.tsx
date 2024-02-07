import type { DomainControlsProps } from '@h5web/lib';
import { DomainControls } from '@h5web/lib';
import type { ReactNode } from 'react';
import styles from './DomainConfig.module.css';

/**
 * The props for the `DomainTools` component.
 * @interface {object} DomainToolsProps
 * @member {string} id - The ID.
 * @member {DomainControlsProps} domainProps - The domain control props.
 * @member {ReactNode} [children] - Any child elements.
 */

export interface DomainToolsProps {
  /** The ID */
  id: string;
  /** The domain control props */
  domainProps: DomainControlsProps;
  /** Any child elements (optional) */
  children?: ReactNode;
}

/**
 *
 * Renders controls to edit domain.
 * @param {DomainToolsProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export function DomainTools({
  id,
  domainProps,
  children,
}: DomainToolsProps): JSX.Element {
  return (
    <div
      id={id}
      className={styles.tools}
      role="dialog"
      aria-label="Edit domain"
    >
      <div className={styles.toolsInner}>
        {children}
        <DomainControls {...domainProps} />
      </div>
    </div>
  );
}
