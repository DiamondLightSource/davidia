import {
  AXIS_SCALE_TYPES,
  COLOR_SCALE_TYPES,
  Separator,
  Toolbar,
  type AxisScaleType,
  type ColorScaleType,
  ToggleBtn,
} from '@h5web/lib';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { BsCardHeading } from 'react-icons/bs';
import { MdGridOn, MdOutlineShapeLine } from 'react-icons/md';
import { TbAxisX, TbAxisY, TbGridDots } from 'react-icons/tb';

import AspectConfigModal from './AspectConfigModal';
import AxisConfigModal from './AxisConfigModal';
import type BaseSelection from './selections/BaseSelection';
import { BatonConfigModal } from './BatonConfigModal';
import ClearSelectionsBtn from './ClearSelectionsBtn';
import InteractionModeToggle from './InteractionModeToggle';
import LabelledInput from './LabelledInput';
import LineConfig from './LineConfig';
import LineKeyDropdown from './LineKeyDropdown';
import type { IIconType } from './Modal';
import Modal from './Modal';
import SelectionTypeDropdown from './SelectionTypeDropdown';
import type { SelectionBase } from './selections/utils';
import SelectionConfig from './SelectionConfig';
import SelectionIDDropdown from './SelectionIDDropdown';
import { InteractionModeType } from './utils';
import { usePlotCustomizationContext } from './PlotCustomizationContext';

/**
 * Props for the `TitleConfigModal` component.
 */
interface TitleConfigModalProps {
  /** The label */
  label?: string;
  /** Handles setting of label */
  setLabel: (value: string) => void;
}

/**
 * Render configuration options for plot title.
 * @param {TitleConfigModalProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function TitleConfigModal(props: TitleConfigModalProps) {
  return Modal({
    title: 'Set title',
    icon: BsCardHeading as IIconType,
    children: (
      <LabelledInput<string>
        key="title-label"
        label="title-label"
        input={props.label ?? ''}
        updateValue={props.setLabel}
      />
    ),
  });
}

export interface PlotToolbarProps {
  /** any child nodes */
  children?: React.ReactNode;
}

/**
 * Set fixed and asDashed properties of selection to false.
 * @param {SelectionBase} s - The selection to modify.
 */
function enableSelection(s: SelectionBase) {
  s.fixed = false;
  s.asDashed = false;
}

/**
 * Set fixed and asDashed properties of selection to true.
 * @param {SelectionBase} s - The selection to modify.
 */
function disableSelection(s: SelectionBase) {
  s.fixed = true;
  s.asDashed = true;
}

interface Props {
  children?: React.ReactNode;
}

/**
 * Render a plot toolbar.
 * @param {Props} props - inner children
 * @returns {JSX.Element} The rendered component.
 */
function PlotToolbar(props: Props): JSX.Element {
  const { children } = props;

  const value = usePlotCustomizationContext();
  const { plotType, updateSelection } = value;

  const { selections, canSelect, setCurrentLineKey } = value;
  const [currentSelectionID, setCurrentSelectionID] = useState<string | null>(
    null
  );
  const firstSelection = useMemo(() => {
    return canSelect && selections.length > 0
      ? selections[selections.length - 1].id
      : null;
  }, [canSelect, selections]);
  useEffect(() => {
    if (firstSelection) {
      console.log('Setting first selection', firstSelection);
      setCurrentSelectionID(firstSelection);
    }
  }, [firstSelection]);

  const [showSelectionConfig, setShowSelectionConfig] = useState(false);
  const [showLineConfig, setShowLineConfig] = useState(false);

  const hasBaton = value.batonProps.hasBaton;
  const selectBaton = canSelect && hasBaton;

  useEffect(() => {
    if (canSelect) {
      selections.map((s) => disableSelection(s));
      if (currentSelectionID === null) {
        if (selections.length > 0) {
          const last = selections[selections.length - 1];
          console.log('Setting current selection', last.id);
          setCurrentSelectionID(last.id);
          enableSelection(last);
        }
      } else {
        const selection = selections.find((s) => s.id === currentSelectionID);
        if (selection) {
          enableSelection(selection);
        }
      }
    }
  }, [canSelect, currentSelectionID, selections]);

  const hasAspect = plotType === 'Heatmap' || plotType === 'Image';
  const overflows = [
    AxisConfigModal<AxisScaleType>({
      title: 'X axis',
      icon: TbAxisX as IIconType,
      label: value.xLabel,
      setLabel: value.setXLabel,
      scaleType: value.xScaleType,
      scaleOptions: AXIS_SCALE_TYPES,
      setScaleType: value.setXScaleType,
      domain: value.xDomain,
      customDomain: value.xCustomDomain,
      setCustomDomain: value.setXCustomDomain,
    }),
    AxisConfigModal<AxisScaleType>({
      title: 'Y axis',
      icon: TbAxisY as IIconType,
      label: value.yLabel,
      setLabel: value.setYLabel,
      scaleType: value.yScaleType,
      scaleOptions: AXIS_SCALE_TYPES,
      setScaleType: value.setYScaleType,
      domain: value.yDomain,
      customDomain: value.yCustomDomain,
      setCustomDomain: value.setYCustomDomain,
    }),
    AspectConfigModal({
      aspect: value.aspect,
      setAspect: value.setAspect,
      hideToggle: !hasAspect,
    }),
    TitleConfigModal({
      label: value.title,
      setLabel: value.setTitle,
    }),
  ];

  const selectionConfig = SelectionConfig({
    selections: selections as BaseSelection[],
    updateSelection,
    currentSelectionID: currentSelectionID,
    updateCurrentSelectionID: setCurrentSelectionID,
    icon: MdOutlineShapeLine as IIconType,
    domain: value.dDomain,
    customDomain: value.dCustomDomain,
    showSelectionConfig: showSelectionConfig,
    updateShowSelectionConfig: setShowSelectionConfig,
    hasBaton: selectBaton,
  });

  const bareModals: JSX.Element[] = [];

  if (canSelect && value.selectionType !== undefined) {
    bareModals.push(
      <SelectionTypeDropdown
        key="Selection type"
        value={value.selectionType}
        onSelectionTypeChange={value.setSelectionType}
        disabled={value.mode !== InteractionModeType.selectRegion}
      />
    );
  }

  const allLineParams = value.allLineParams;
  const lineConfig = LineConfig({
    allLineParams,
    updateLineParams: value.updateLineParams,
    currentLineKey: value.currentLineKey,
    showLineConfig,
    updateShowLineConfig: setShowLineConfig,
    hasBaton,
  });

  const isLine = plotType === 'Line';
  const isSurface = plotType === 'Surface';
  const isScatter = plotType === 'Scatter';

  bareModals.push(
    <ToggleBtn
      key="show points"
      label="show points"
      icon={TbGridDots as IIconType}
      iconOnly
      value={value.showPoints}
      onToggle={value.toggleShowPoints}
      hidden={!isSurface}
    />
  );
  if (isSurface) {
    bareModals.push(<Separator key="Show point separator" />);
  }

  const showColourMap = isScatter || plotType === 'Heatmap' || isSurface;

  bareModals.push(
    AxisConfigModal<ColorScaleType>({
      title: 'Colour mapping',
      scaleType: value.dScaleType,
      setScaleType: value.setDScaleType,
      scaleOptions: COLOR_SCALE_TYPES,
      colourMap: value.colourMap,
      setColourMap: value.setColourMap,
      invertColourMap: value.invertColourMap,
      toggleColourMapInversion: value.toggleInvertColourMap,
      domain: value.dDomain,
      customDomain: value.dCustomDomain,
      setCustomDomain: value.setDCustomDomain,
      histogram: value.histogram,
      scatterPointSize: isScatter ? value.scatterPointSize : undefined,
      setScatterPointSize: value.setScatterPointSize,
      hasBaton,
      hideToggle: !showColourMap,
    })
  );
  if (showColourMap) {
    bareModals.push(<Separator key="Colour mapping separator" />);
  }
  overflows.push(
    <ToggleBtn
      key="Grid toggle"
      label="Grid toggle"
      icon={MdGridOn}
      value={value.showGrid}
      onToggle={value.toggleShowGrid}
    />
  );
  overflows.push(BatonConfigModal({ ...value.batonProps }));

  /**
   * Set line properties.
   * @param {string} k - The line key.
   */
  const onLineKeyChange = useCallback(
    (k: string) => {
      if (allLineParams.has(k)) {
        setCurrentLineKey(k);
      }
      setShowLineConfig(true);
    },
    [allLineParams, setCurrentLineKey]
  );

  if (allLineParams.size) {
    console.log('Add line key dropdown', allLineParams);
    overflows.push(
      <LineKeyDropdown
        key="key dropdown"
        allLineParams={allLineParams}
        lineKey={value.currentLineKey}
        onLineKeyChange={onLineKeyChange}
      />
    );
  }

  /**
   * Set fixed and asDashed properties of selection to true.
   * @param {string} i - The selection id.
   */
  const onSelectionIDChange = useCallback(
    (i: string) => {
      if (canSelect) {
        const selection = selections.find((s) => s.id === i);
        if (selection !== undefined) {
          setCurrentSelectionID(i);
          if (canSelect) {
            updateSelection(selection);
            console.log('updated selections: ', selections);
          }
        }
        setShowSelectionConfig(true);
      }
    },
    [canSelect, selections, updateSelection]
  );

  if (canSelect && selections.length > 0) {
    overflows.push(
      <SelectionIDDropdown
        key="ID dropdown"
        selections={selections}
        selectionID={currentSelectionID}
        onSelectionIDChange={onSelectionIDChange}
      />
    );
    overflows.push(
      <ClearSelectionsBtn
        key="Clear all selections"
        selections={selections as BaseSelection[]}
        updateSelection={updateSelection}
        currentSelectionID={currentSelectionID}
        updateCurrentSelectionID={setCurrentSelectionID}
        disabled={!selectBaton}
      />
    );
  }

  return (
    <Toolbar overflowChildren={overflows}>
      <InteractionModeToggle
        key="Interaction toggle"
        value={value.mode}
        onModeChange={value.setMode}
        hasBaton={selectBaton}
      />
      {canSelect && <Separator key="Interaction separator" />}
      {bareModals}
      {canSelect && (
        <Fragment key="Selection config">{selectionConfig}</Fragment>
      )}
      {isLine && <Fragment key="Line config">{lineConfig}</Fragment>}
      {children}
    </Toolbar>
  );
}

interface AnyToolbarProps {
  children?: React.ReactNode;
  extraChildren?: React.ReactNode;
}

/**
 * Toolbar component for any plot
 */
export function AnyToolbar(props: AnyToolbarProps) {
  return (
    props.children !== null &&
    (props.children === undefined ? (
      <PlotToolbar>{props.extraChildren}</PlotToolbar>
    ) : (
      <Toolbar>{props.children}</Toolbar>
    ))
  );
}

export default PlotToolbar;
