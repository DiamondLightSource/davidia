import {
  AXIS_SCALE_TYPES,
  COLOR_SCALE_TYPES,
  GridToggler,
  Separator,
  Toolbar,
  type AxisScaleType,
  type ColorScaleType,
} from '@h5web/lib';
import { Fragment, useEffect, useState } from 'react';
import { BsCardHeading } from 'react-icons/bs';
import { MdAspectRatio, MdOutlineShapeLine } from 'react-icons/md';
import { TbAxisX, TbAxisY } from 'react-icons/tb';

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
import type { AddSelectionHandler, SelectionBase } from './selections/utils';
import SelectionConfig from './SelectionConfig';
import SelectionIDDropdown from './SelectionIDDropdown';
import { InteractionModeType } from './utils';
import { usePlotCustomizationContext } from './PlotCustomizationContext';

/**
 * Props for the `TitleConfigModal` component.
 */
interface TitleConfigModalProps {
  /** The modal title */
  title: string;
  /** The modal icon */
  icon?: IIconType;
  /** The label */
  label?: string;
  /** Handles setting of label */
  setLabel: (value: string) => void;
}

/**
 * Render configuration options for plot title.
 * @param {TitleConfigModalProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function TitleConfigModal(props: TitleConfigModalProps) {
  return Modal({
    title: props.title,
    icon: props.icon,
    children: (
      <LabelledInput<string>
        key="title"
        label="title"
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
 * Render a plot toolbar.
 * @param {PlotToolbarProps} props
 * @returns {React.JSX.Element} The rendered component.
 */
function PlotToolbar({ children }: PlotToolbarProps): React.JSX.Element {
  const value = usePlotCustomizationContext();

  const { selections, updateSelection } = value;
  const firstSelection =
    selections.length > 0 ? selections[selections.length - 1].id : null;
  const firstLine =
    value.lineData && value.lineData.length > 0
      ? value.lineData[value.lineData.length - 1].key
      : null;
  const [currentSelectionID, setCurrentSelectionID] = useState<string | null>(
    firstSelection
  );
  const [currentLineKey, setCurrentLineKey] = useState<string | null>(
    firstLine
  );
  const [showSelectionConfig, setShowSelectionConfig] = useState(false);
  const [showLineConfig, setShowLineConfig] = useState(false);

  /**
   * Set fixed and asDashed properties of selection to true.
   * @param {SelectionBase} s - The selection to modify.
   */
  function enableSelection(s: SelectionBase) {
    s.fixed = true;
    s.asDashed = true;
  }

  /**
   * Set fixed and asDashed properties of selection to false.
   * @param {SelectionBase} s - The selection to modify.
   */
  function disableSelection(s: SelectionBase) {
    s.fixed = false;
    s.asDashed = false;
  }

  useEffect(() => {
    selections.map((s) => disableSelection(s));
    if (showSelectionConfig) {
      const selection = selections.find((s) => s.id === currentSelectionID);
      if (selection) {
        enableSelection(selection);
      }
    }
  }, [currentSelectionID, selections, showSelectionConfig]);

  useEffect(() => {
    if (currentSelectionID === null && selections.length > 0) {
      setCurrentSelectionID(selections[selections.length - 1].id);
    }
  }, [selections, currentSelectionID]);

  const modals = [
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
  ];
  if (value.aspect !== undefined && value.setAspect !== undefined) {
    modals.push(
      AspectConfigModal({
        title: 'Aspect ratio',
        icon: MdAspectRatio as IIconType,
        aspect: value.aspect,
        setAspect: value.setAspect,
      })
    );
  }
  modals.push(
    TitleConfigModal({
      title: 'Set title',
      icon: BsCardHeading as IIconType,
      label: value.title,
      setLabel: value.setTitle,
    })
  );

  let selectionConfig = null;
  if (updateSelection !== null) {
    selectionConfig = SelectionConfig({
      title: 'Selections',
      selections: selections as BaseSelection[],
      updateSelection: updateSelection as AddSelectionHandler,
      currentSelectionID: currentSelectionID,
      updateCurrentSelectionID: setCurrentSelectionID,
      icon: MdOutlineShapeLine as IIconType,
      domain: value.dDomain,
      customDomain: value.dCustomDomain,
      showSelectionConfig: showSelectionConfig,
      updateShowSelectionConfig: setShowSelectionConfig,
      hasBaton: value.batonProps?.hasBaton ?? true,
    });
  }

  let lineConfig = null;
  if (value.lineData !== undefined && value.updateLineParams !== undefined) {
    lineConfig = LineConfig({
      title: 'Lines',
      lineData: value.lineData,
      updateLineParams: value.updateLineParams,
      currentLineKey: currentLineKey,
      showLineConfig: showLineConfig,
      updateShowLineConfig: setShowLineConfig,
      hasBaton: value.batonProps?.hasBaton ?? true,
    });
  }

  const bareModals = [];
  const overflows = [];
  modals.forEach((m) => {
    if (m[0]) bareModals.push(m[0]);
    if (m[1]) overflows.push(m[1]);
  });

  if (
    value.selectionType !== undefined &&
    value.setSelectionType !== undefined &&
    updateSelection != null
  ) {
    bareModals.push(
      <SelectionTypeDropdown
        key="Selection type"
        value={value.selectionType}
        onSelectionTypeChange={value.setSelectionType}
        disabled={value.mode !== InteractionModeType.selectRegion}
      />
    );
  }

  if (value.colourMap !== undefined) {
    const a = AxisConfigModal<ColorScaleType>({
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
      dData: value.dData,
      scatterPointSize: value.scatterPointSize,
      setScatterPointSize: value.setScatterPointSize,
      batonProps: value.batonProps,
    });
    a.forEach((m) => {
      if (m) bareModals.push(m);
    });
    bareModals.push(<Separator key="Colour mapping separator" />);
  }

  if (value.batonProps) {
    overflows.push(
      <GridToggler
        key="Grid toggle"
        value={value.showGrid}
        onToggle={value.toggleShowGrid}
      />
    );
    const b = BatonConfigModal(value.batonProps);
    if (b[0]) bareModals.push(b[0]);
    if (b[1]) overflows.push(b[1]);
  }

  /**
   * Set line properties.
   * @param {string} k - The line key.
   */
  function onLineKeyChange(k: string) {
    const line = value.lineData?.find((s) => s.key === k);
    if (line !== undefined) {
      setCurrentLineKey(k);
      if (value.updateLineParams) {
        value.updateLineParams(line);
        console.log('updated line parameters: ', value.lineData);
      }
    }
    setShowLineConfig(true);
  }

  if (value.lineData) {
    overflows.push(
      <LineKeyDropdown
        key="key dropdown"
        lines={value.lineData}
        lineKey={currentLineKey}
        onLineKeyChange={onLineKeyChange}
      />
    );
  }

  /**
   * Set fixed and asDashed properties of selection to true.
   * @param {string} i - The selection id.
   */
  function onSelectionIDChange(i: string) {
    const selection = selections.find((s) => s.id === i);
    if (selection !== undefined) {
      setCurrentSelectionID(i);
      if (updateSelection) {
        updateSelection(selection);
        console.log('updated selections: ', selections);
      }
    }
    setShowSelectionConfig(true);
  }

  if (selections.length > 0) {
    overflows.push(
      <SelectionIDDropdown
        key="ID dropdown"
        selections={selections}
        selectionID={currentSelectionID}
        onSelectionIDChange={onSelectionIDChange}
      />
    );
  }

  if (selections.length > 0 && updateSelection) {
    overflows.push(
      <ClearSelectionsBtn
        key="Clear all selections"
        selections={selections as BaseSelection[]}
        updateSelection={updateSelection}
        currentSelectionID={currentSelectionID}
        updateCurrentSelectionID={setCurrentSelectionID}
        disabled={!(value.batonProps?.hasBaton ?? true)}
      ></ClearSelectionsBtn>
    );
  }

  return (
    <Toolbar overflowChildren={overflows}>
      {value.mode && value.setMode ? (
        <InteractionModeToggle
          key="Interaction toggle"
          value={value.mode}
          onModeChange={value.setMode}
          hasBaton={value.batonProps?.hasBaton ?? updateSelection !== null}
        />
      ) : null}
      <Separator key="Interaction separator" />
      {bareModals}
      selectionConfig &&
      {<Fragment key="Selection config">{selectionConfig}</Fragment>}
      lineConfig &&
      {<Fragment key="Line config">{lineConfig}</Fragment>}
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
