import { format } from 'd3-format';
import {
  BoundEditor,
  DomainError,
  ErrorMessage,
  Histogram,
  ScaledSlider,
  ToggleBtn,
  useSafeDomain,
  useVisDomain,
} from '@h5web/lib';
import type {
  BoundEditorHandle,
  CustomDomain,
  Domain,
  DomainErrors,
  HistogramParams,
  ScaleType,
} from '@h5web/lib';

import { useClickOutside, useKeyboardEvent, useToggle } from '@react-hookz/web';
import { useRef, useEffect, useState, useMemo } from 'react';
import type { ReactNode } from 'react';

import styles from './DomainControls.module.css';

interface DomainToolsProps {
  id: string;
  sliderDomain: Domain;
  dataDomain: Domain;
  errors: DomainErrors;
  isAutoMin: boolean;
  isAutoMax: boolean;
  onAutoMinToggle: () => void;
  onAutoMaxToggle: () => void;
  isEditingMin: boolean;
  isEditingMax: boolean;
  onEditMin: (force: boolean) => void;
  onEditMax: (force: boolean) => void;
  onChangeMin: (val: number) => void;
  onChangeMax: (val: number) => void;
  onSwap: () => void;
  children?: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const formatBound = format('.3~e');

function DomainTools(props: DomainToolsProps) {
  const { id, sliderDomain, dataDomain, errors, children } = props;
  const { isAutoMin, isAutoMax, isEditingMin, isEditingMax } = props;
  const {
    onAutoMinToggle,
    onAutoMaxToggle,
    onEditMin,
    onEditMax,
    onChangeMin,
    onChangeMax,
    onSwap,
  } = props;

  const { minGreater, minError, maxError } = errors;
  const minEditorRef = useRef<BoundEditorHandle>(null);
  const maxEditorRef = useRef<BoundEditorHandle>(null);

  return (
    <div
      id={id}
      className={styles.tools}
      role="dialog"
      aria-label="Edit domain"
    >
      <div className={styles.toolsInner}>
        {children}
        <div className={styles.toolsControls}>
          {minGreater && (
            <ErrorMessage
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              error={DomainError.MinGreater}
              showSwapBtn={!isAutoMin && !isAutoMax}
              onSwap={onSwap}
            />
          )}
          <BoundEditor
            ref={minEditorRef}
            bound="min"
            value={sliderDomain[0]}
            isEditing={isEditingMin}
            hasError={minGreater ?? !!minError}
            onEditToggle={onEditMin}
            onChange={onChangeMin}
          />
          {minError && <ErrorMessage error={minError} />}

          <BoundEditor
            ref={maxEditorRef}
            bound="max"
            value={sliderDomain[1]}
            isEditing={isEditingMax}
            hasError={minGreater ?? !!maxError}
            onEditToggle={onEditMax}
            onChange={onChangeMax}
          />
          {maxError && <ErrorMessage error={maxError} />}

          <p className={styles.dataRange}>
            Data range{' '}
            <span>
              [{' '}
              <abbr title={dataDomain[0].toString()}>
                {formatBound(dataDomain[0])}
              </abbr>{' '}
              ,{' '}
              <abbr title={dataDomain[1].toString()}>
                {formatBound(dataDomain[1])}
              </abbr>{' '}
              ]
            </span>
          </p>

          <p className={styles.autoscale}>
            Autoscale{' '}
            <ToggleBtn
              label="Min"
              raised
              value={isAutoMin}
              onToggle={onAutoMinToggle}
            />
            <ToggleBtn
              label="Max"
              raised
              value={isAutoMax}
              onToggle={onAutoMaxToggle}
            />
          </p>
        </div>
      </div>
    </div>
  );
}

const TOOLS_ID = 'domain-tools';

interface DomainControlsProps {
  dataDomain: Domain;
  customDomain: CustomDomain;
  scaleType: ScaleType;
  onCustomDomainChange: (domain: CustomDomain) => void;
  histogramFunction?: () => HistogramParams | undefined;
}

function DomainControls(props: DomainControlsProps) {
  const { dataDomain, customDomain, scaleType } = props;
  const { onCustomDomainChange, histogramFunction } = props;

  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain, errors] = useSafeDomain(visDomain, dataDomain, scaleType);

  const [sliderDomain, setSliderDomain] = useState(visDomain);
  useEffect(() => {
    setSliderDomain(visDomain);
  }, [visDomain]);

  const isAutoMin = customDomain[0] === null;
  const isAutoMax = customDomain[1] === null;

  const [isEditingMin, toggleEditingMin] = useToggle(false);
  const [isEditingMax, toggleEditingMax] = useToggle(false);
  const isEditing = isEditingMin || isEditingMax;

  function toggleEditing(force: boolean) {
    toggleEditingMin(force);
    toggleEditingMax(force);
  }

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

  const histogram = useMemo(
    () => (histogramFunction ? histogramFunction() : undefined),
    [histogramFunction]
  );
  return (
    <div ref={rootRef} className={styles.root}>
      {!histogramFunction && (
        <div className={styles.sliderContainer}>
          <ScaledSlider
            value={sliderDomain}
            safeVisDomain={safeDomain}
            dataDomain={dataDomain}
            scaleType={scaleType}
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
      <DomainTools
        id={TOOLS_ID}
        sliderDomain={sliderDomain}
        dataDomain={dataDomain}
        errors={errors}
        isAutoMin={isAutoMin}
        isAutoMax={isAutoMax}
        onAutoMinToggle={() => {
          const newMin = isAutoMin ? dataDomain[0] : null;
          onCustomDomainChange([newMin, customDomain[1]]);
          if (!isAutoMin) {
            toggleEditingMin(false);
          }
        }}
        onAutoMaxToggle={() => {
          const newMax = isAutoMax ? dataDomain[1] : null;
          onCustomDomainChange([customDomain[0], newMax]);
          if (!isAutoMax) {
            toggleEditingMax(false);
          }
        }}
        isEditingMin={isEditingMin}
        isEditingMax={isEditingMax}
        onEditMin={toggleEditingMin}
        onEditMax={toggleEditingMax}
        onChangeMin={(val) => onCustomDomainChange([val, customDomain[1]])}
        onChangeMax={(val) => onCustomDomainChange([customDomain[0], val])}
        onSwap={() => onCustomDomainChange([customDomain[1], customDomain[0]])}
      >
        {histogram && (
          <Histogram
            dataDomain={dataDomain}
            value={sliderDomain}
            scaleType={scaleType}
            onChange={onCustomDomainChange}
            {...histogram}
          />
        )}
      </DomainTools>
    </div>
  );
}

DomainControls.displayName = 'DomainControls';

export default DomainControls;
