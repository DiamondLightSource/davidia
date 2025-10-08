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
import { useRef, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import styles from './DomainConfig.module.css';

/**
 * Props for the `DomainTools` component.
 */
interface DomainToolsProps {
  /** The ID */
  id: string;
  /** The domain control props */
  domainProps: DomainControlsProps;
}

// eslint-disable-next-line react-refresh/only-export-components
export const formatBound = format('.3~e');

/**
 *
 * Renders controls to edit domain.
 * @param {DomainToolsProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function DomainTools(props: PropsWithChildren<DomainToolsProps>) {
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
  histogramGetter?: () => Promise<HistogramParams>;
}

/**
 * Render the configuration options for a domain.
 * @param {DomainConfigProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function DomainConfig(props: DomainConfigProps) {
  const { dataDomain, customDomain, scaleType } = props;
  const { onCustomDomainChange, histogramGetter } = props;
  const [lockDomain, setLockDomain] = useState<boolean>(false);

  const visDomain = useVisDomain(customDomain, dataDomain);

  const [histogram, setHistogram] = useState<HistogramParams>();

  useEffect(() => {
    if (histogramGetter) {
      console.time("Histogram calc");
      const hp = histogramGetter();
      hp.then((h) => {
        console.timeEnd("Histogram calc");
        setHistogram(h);
      }).catch((e) => {
        console.log('Could not calculate histogram:', e);
      });
    }
  }, [histogramGetter, setHistogram]);

  const memoizedCustomDomain = useMemo(() => {
    if (lockDomain) {
      return customDomain;
    } else {
      return visDomain;
    }
  }, [lockDomain, customDomain, visDomain]);

  useEffect(() => {
    if (!lockDomain) {
      onCustomDomainChange(dataDomain);
    }
  }, [dataDomain, lockDomain, onCustomDomainChange]);

  const [safeDomain, errors] = useSafeDomain(
    visDomain,
    dataDomain,
    scaleType ?? ScaleType.Linear
  );

  const [sliderDomain, setSliderDomain] = useState<Domain>(visDomain);
  useEffect(() => {
    setSliderDomain(visDomain);
  }, [visDomain]);

  const isAutoMin = memoizedCustomDomain[0] === null;
  const isAutoMax = memoizedCustomDomain[1] === null;

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
      onCustomDomainChange([newMin, memoizedCustomDomain[1]]);
      if (!isAutoMin) {
        toggleEditingMin(false);
      }
    },
    onAutoMaxToggle: () => {
      const newMax = isAutoMax ? dataDomain[1] : null;
      onCustomDomainChange([memoizedCustomDomain[0], newMax]);
      if (!isAutoMax) {
        toggleEditingMax(false);
      }
    },
    isEditingMin,
    isEditingMax,
    onEditMin: toggleEditingMin,
    onEditMax: toggleEditingMax,
    onChangeMin: (val) => onCustomDomainChange([val, memoizedCustomDomain[1]]),
    onChangeMax: (val) => onCustomDomainChange([memoizedCustomDomain[0], val]),
    onSwap: () =>
      onCustomDomainChange([memoizedCustomDomain[1], memoizedCustomDomain[0]]),
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
                hasMinChanged ? sliderDomain[0] : memoizedCustomDomain[0],
                hasMaxChanged ? sliderDomain[1] : memoizedCustomDomain[1],
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
            onChangeMin={(val) =>
              onCustomDomainChange([val, memoizedCustomDomain[1]])
            }
            onChangeMax={(val) =>
              onCustomDomainChange([memoizedCustomDomain[0], val])
            }
            {...histogram}
          />
        )}
      </DomainTools>
      <label>
        <input
          type="checkbox"
          checked={lockDomain}
          onChange={() => {
            setLockDomain((l) => !l);
          }}
        />
        Lock domain?
      </label>
    </div>
  );
}

DomainConfig.displayName = 'DomainConfig';

export default DomainConfig;
export type { DomainConfigProps };
