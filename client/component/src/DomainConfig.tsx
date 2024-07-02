import { format } from 'd3-format';
import {
  DomainControls,
  DomainSlider,
  Histogram,
  ScaleType,
  useSafeDomain,
  useVisDomain,
} from '@h5web/lib';
import type {
  ColorScaleType,
  CustomDomain,
  Domain,
  DomainControlsProps,
  HistogramParams,
} from '@h5web/lib';

import { useClickOutside, useKeyboardEvent, useToggle } from '@react-hookz/web';
import { useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import styles from './DomainConfig.module.css';

/**
 * Props for the `DomainTools` component.
 */
interface DomainToolsProps {
  /** The ID */
  id: string;
  /** The domain control props */
  domainProps: DomainControlsProps;
  /** Any child elements (optional) */
  children?: ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
export const formatBound = format('.3~e');

/**
 *
 * Renders controls to edit domain.
 * @param {DomainToolsProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function DomainTools(props: DomainToolsProps) {
  const { id, domainProps, children } = props;

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

const TOOLS_ID = 'domain-tools';

/**
 * Props for the `DomainConfig` component.
 */
interface DomainConfigProps {
  /** The domain to configure */
  dataDomain: Domain;
  /** The custom domain */
  customDomain: CustomDomain;
  /** The type of the colour scale */
  scaleType?: ColorScaleType;
  /** Handles custom domain change */
  onCustomDomainChange: (domain: CustomDomain) => void;
  /** Histogram params */
  histogram?: HistogramParams;
}

/**
 * Render the configuration options for a domain.
 * @param {DomainConfigProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function DomainConfig(props: DomainConfigProps) {
  const { dataDomain, customDomain, scaleType } = props;
  const { onCustomDomainChange, histogram } = props;

  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain, errors] = useSafeDomain(
    visDomain,
    dataDomain,
    scaleType ?? ScaleType.Linear
  );

  const [sliderDomain, setSliderDomain] = useState<Domain>(visDomain);
  useEffect(() => {
    setSliderDomain(visDomain);
  }, [visDomain]);

  const isAutoMin = customDomain[0] === null;
  const isAutoMax = customDomain[1] === null;

  const [isEditingMin, toggleEditingMin] = useToggle(false);
  const [isEditingMax, toggleEditingMax] = useToggle(false);
  const isEditing = isEditingMin || isEditingMax;

  /**
   * Toggles editing
   * @param {boolean} force
   */
  function toggleEditing(force: boolean) {
    toggleEditingMin(force);
    toggleEditingMax(force);
  }

  /**
   * Cancels editing
   */
  function cancelEditing() {
    if (isEditing) {
      toggleEditing(false);
    }
  }

  const rootRef = useRef(null);

  useClickOutside(rootRef, cancelEditing);
  useKeyboardEvent('Escape', () => {
    cancelEditing();
  });

  const domainProps = {
    sliderDomain,
    dataDomain,
    errors,
    isAutoMin,
    isAutoMax,
    onAutoMinToggle: () => {
      const newMin = isAutoMin ? dataDomain[0] : null;
      onCustomDomainChange([newMin, customDomain[1]]);
      if (!isAutoMin) {
        toggleEditingMin(false);
      }
    },
    onAutoMaxToggle: () => {
      const newMax = isAutoMax ? dataDomain[1] : null;
      onCustomDomainChange([customDomain[0], newMax]);
      if (!isAutoMax) {
        toggleEditingMax(false);
      }
    },
    isEditingMin,
    isEditingMax,
    onEditMin: toggleEditingMin,
    onEditMax: toggleEditingMax,
    onChangeMin: (val) => onCustomDomainChange([val, customDomain[1]]),
    onChangeMax: (val) => onCustomDomainChange([customDomain[0], val]),
    onSwap: () => onCustomDomainChange([customDomain[1], customDomain[0]]),
  } as DomainControlsProps;

  return (
    <div ref={rootRef} className={styles.root}>
      {!histogram && (
        <div className={styles.sliderContainer}>
          <DomainSlider
            value={sliderDomain}
            safeVisDomain={safeDomain}
            dataDomain={dataDomain}
            scaleType={scaleType ?? ScaleType.Linear}
            errors={errors}
            isAutoMin={isAutoMin}
            isAutoMax={isAutoMax}
            onChange={(newValue) => {
              setSliderDomain(newValue);
              toggleEditing(false);
            }}
            onAfterChange={(hasMinChanged, hasMaxChanged) => {
              onCustomDomainChange([
                hasMinChanged ? sliderDomain[0] : customDomain[0],
                hasMaxChanged ? sliderDomain[1] : customDomain[1],
              ]);
            }}
          />
        </div>
      )}
      <DomainTools id={TOOLS_ID} domainProps={domainProps}>
        {histogram && (
          <Histogram
            dataDomain={dataDomain}
            value={sliderDomain}
            scaleType={scaleType ?? ScaleType.Linear}
            onChangeMin={(val) => onCustomDomainChange([val, customDomain[1]])}
            onChangeMax={(val) => onCustomDomainChange([customDomain[0], val])}
            {...histogram}
          />
        )}
      </DomainTools>
    </div>
  );
}

DomainConfig.displayName = 'DomainConfig';

export default DomainConfig;
export type { DomainConfigProps };
