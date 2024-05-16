import {
  type Aspect,
  AXIS_SCALE_TYPES,
  type AxisScaleType,
  COLOR_SCALE_TYPES,
  type ColorMap,
  type ColorScaleType,
  type CustomDomain,
  type Domain,
  GridToggler,
  Separator,
  Toolbar,
} from '@h5web/lib';
import type { TypedArray } from 'ndarray';
import type { ReactNode } from 'react';
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
import type { LineData } from './LinePlot';
import LineConfig from './LineConfig';
import LineKeyDropdown from './LineKeyDropdown';
import type { IIconType } from './Modal';
import Modal from './Modal';
import SelectionTypeDropdown from './SelectionTypeDropdown';
import type { SelectionBase, SelectionType } from './selections/utils';
import SelectionConfig from './SelectionConfig';
import SelectionIDDropdown from './SelectionIDDropdown';
import type { BatonProps } from './AnyPlot';
import { InteractionModeType } from './utils';

/**
 * Props for the `TitleConfigModal` component.
 */
interface TitleConfigModalProps {
  /** The modal title */
  title: string;
  /** The modal icon (optional) */
  icon?: IIconType;
  /** The label (optional) */
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

/**
 * Props for the `PlotToolbar` component.
 */
interface PlotToolbarProps {
  /** If the grid should be shown */
  showGrid: boolean;
  /** Toggles the grid */
  toggleShowGrid: () => void;
  /** The title */
  title: string;
  /** A function that sets the title */
  setTitle: (t: string) => void;
  /** The mode (optional) */
  mode?: InteractionModeType;
  /** An optional function that sets the mode */
  setMode?: (m: InteractionModeType) => void;
  /** A domain value for the x-axis (optional) */
  xDomain?: Domain;
  /** A custom domain value for the x-axis (optional) */
  xCustomDomain?: CustomDomain;
  /** A function that sets the custom domain value for the x-axis (optional) */
  setXCustomDomain?: (d: CustomDomain) => void;
  /** The label for the x-axis */
  xLabel: string;
  /** A function that sets the label for the x-axis */
  setXLabel: (l: string) => void;
  /** An axis scale type for the x-axis (optional) */
  xScaleType?: AxisScaleType;
  /** An optional function that sets the axis scale type for the x-axis */
  setXScaleType?: (s: AxisScaleType) => void;
  /** A domain value for the y-axis (optional) */
  yDomain?: Domain;
  /** A custom domain value for the y-axis (optional) */
  yCustomDomain?: CustomDomain;
  /** A function that sets the custom domain value for the y-axis (optional) */
  setYCustomDomain?: (d: CustomDomain) => void;
  /** The label for the y-axis */
  yLabel: string;
  /** A function that sets the label for the y-axis */
  setYLabel: (l: string) => void;
  /** The baton properties */
  batonProps?: BatonProps;
  /** An axis scale type for the y-axis (optional) */
  yScaleType?: AxisScaleType;
  /** A function that sets the axis scale type for the y-axis (optional) */
  setYScaleType?: (s: AxisScaleType) => void;
  /** An aspect value (optional) */
  aspect?: Aspect;
  /** A function that sets the aspect value (optional) */
  setAspect?: (a: Aspect) => void;
  /** A selection type (optional) */
  selectionType?: SelectionType;
  /** A function that sets the selection type (optional) */
  setSelectionType?: (s: SelectionType) => void;
  /** A domain value for the d-axis (optional) */
  dDomain?: Domain;
  /** A custom domain value for the d-axis (optional) */
  dCustomDomain?: CustomDomain;
  /** A function that sets the custom domain value for the d-axis (optional) */
  setDCustomDomain?: (d: CustomDomain) => void;
  /** Data for the d-axis (optional) */
  dData?: TypedArray;
  /** A color scale type for the d-axis (optional) */
  dScaleType?: ColorScaleType;
  /** A function that sets the color scale type for the d-axis (optional) */
  setDScaleType?: (s: ColorScaleType) => void;
  /** A color map (optional) */
  colourMap?: ColorMap;
  /** A function that sets the color map (optional) */
  setColourMap?: (c: ColorMap) => void;
  /** Whether to invert the color map */
  invertColourMap?: boolean;
  /** A function that toggles the color map inversion */
  toggleInvertColourMap?: () => void;
  /** Selections (optional) */
  selections?: SelectionBase[];
  /** A function that updates the selections (optional) */
  updateSelections?: (
    s: SelectionBase | null,
    b?: boolean,
    c?: boolean
  ) => void;
  lineData?: LineData[];
  updateLineParams?: (p: LineData) => void;
  /** The size of scatter data points. */
  scatterPointSize?: number;
  /** A function that updates the selections (optional) */
  setScatterPointSize?: (p: number) => void;
  /** Any child components (optional) */
  children?: ReactNode;
}

/**
 * Render a plot toolbar.
 * @param {PlotToolbarProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function PlotToolbar(props: PlotToolbarProps) {
  const firstSelection =
    props.selections && props.selections.length > 0
      ? props.selections[props.selections.length - 1].id
      : null;
  const firstLine =
    props.lineData && props.lineData.length > 0
      ? props.lineData[props.lineData.length - 1].key
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
    props.selections?.map((s) => disableSelection(s));
    if (showSelectionConfig) {
      const selection = props.selections?.find(
        (s) => s.id === currentSelectionID
      );
      if (selection) {
        enableSelection(selection);
      }
    }
  }, [currentSelectionID, props.selections, showSelectionConfig]);

  useEffect(() => {
    if (
      currentSelectionID === null &&
      props.selections &&
      props.selections.length > 0
    ) {
      setCurrentSelectionID(props.selections[props.selections.length - 1].id);
    }
  }, [props.selections, currentSelectionID]);

  const modals = [
    AxisConfigModal<AxisScaleType>({
      title: 'X axis',
      icon: TbAxisX as IIconType,
      label: props.xLabel,
      setLabel: props.setXLabel,
      scaleType: props.xScaleType,
      scaleOptions: AXIS_SCALE_TYPES,
      setScaleType: props.setXScaleType,
      domain: props.xDomain,
      customDomain: props.xCustomDomain,
      setCustomDomain: props.setXCustomDomain,
    }),
    AxisConfigModal<AxisScaleType>({
      title: 'Y axis',
      icon: TbAxisY as IIconType,
      label: props.yLabel,
      setLabel: props.setYLabel,
      scaleType: props.yScaleType,
      scaleOptions: AXIS_SCALE_TYPES,
      setScaleType: props.setYScaleType,
      domain: props.yDomain,
      customDomain: props.yCustomDomain,
      setCustomDomain: props.setYCustomDomain,
    }),
  ];
  if (props.aspect !== undefined && props.setAspect !== undefined) {
    modals.push(
      AspectConfigModal({
        title: 'Aspect ratio',
        icon: MdAspectRatio as IIconType,
        aspect: props.aspect,
        setAspect: props.setAspect,
      })
    );
  }
  modals.push(
    TitleConfigModal({
      title: 'Set title',
      icon: BsCardHeading as IIconType,
      label: props.title,
      setLabel: props.setTitle,
    })
  );

  let selectionConfig = null;
  if (props.selections !== undefined && props.updateSelections !== undefined) {
    selectionConfig = SelectionConfig({
      title: 'Selections',
      selections: props.selections as BaseSelection[],
      updateSelections: props.updateSelections,
      currentSelectionID: currentSelectionID,
      updateCurrentSelectionID: setCurrentSelectionID,
      icon: MdOutlineShapeLine as IIconType,
      domain: props.dDomain,
      customDomain: props.dCustomDomain,
      showSelectionConfig: showSelectionConfig,
      updateShowSelectionConfig: setShowSelectionConfig,
      hasBaton: props.batonProps?.hasBaton ?? true,
    });
  } else {
    console.log(
      'props.selections are: ',
      props.selections,
      ' props.updateSelections is: ',
      props.updateSelections
    );
  }

  let lineConfig = null;
  if (props.lineData !== undefined && props.updateLineParams !== undefined) {
    lineConfig = LineConfig({
      title: 'Lines',
      lineData: props.lineData,
      updateLineParams: props.updateLineParams,
      currentLineKey: currentLineKey,
      showLineConfig: showLineConfig,
      updateShowLineConfig: setShowLineConfig,
      hasBaton: props.batonProps?.hasBaton ?? true,
    });
  } else {
    console.log(
      'props.selections are: ',
      props.selections,
      ' props.updateSelections is: ',
      props.updateSelections
    );
  }

  const bareModals = [];
  const overflows = [];
  modals.forEach((m) => {
    if (m[0]) bareModals.push(m[0]);
    if (m[1]) overflows.push(m[1]);
  });

  if (
    props.selectionType !== undefined &&
    props.setSelectionType !== undefined
  ) {
    bareModals.push(
      <SelectionTypeDropdown
        key="Selection type"
        value={props.selectionType}
        onSelectionTypeChange={props.setSelectionType}
        disabled={props.mode !== InteractionModeType.selectRegion}
      />
    );
  }

  if (props.colourMap !== undefined) {
    const a = AxisConfigModal<ColorScaleType>({
      title: 'Colour mapping',
      scaleType: props.dScaleType,
      setScaleType: props.setDScaleType,
      scaleOptions: COLOR_SCALE_TYPES,
      colourMap: props.colourMap,
      setColourMap: props.setColourMap,
      invertColourMap: props.invertColourMap,
      toggleColourMapInversion: props.toggleInvertColourMap,
      domain: props.dDomain,
      customDomain: props.dCustomDomain,
      setCustomDomain: props.setDCustomDomain,
      dData: props.dData,
      scatterPointSize: props.scatterPointSize,
      setScatterPointSize: props.setScatterPointSize,
      batonProps: props.batonProps,
    });
    a.forEach((m) => {
      if (m) bareModals.push(m);
    });
    bareModals.push(<Separator key="Colour mapping separator" />);
  }

  if (props.batonProps) {
    overflows.push(
      <GridToggler
        key="Grid toggle"
        value={props.showGrid}
        onToggle={props.toggleShowGrid}
      />
    );
    const b = BatonConfigModal(props.batonProps);
    if (b[0]) bareModals.push(b[0]);
    if (b[1]) overflows.push(b[1]);
  }

  /**
   * Set line properties.
   * @param {string} k - The line key.
   */
  function onLineKeyChange(k: string) {
    const line = props.lineData?.find((s) => s.key === k);
    if (line !== undefined) {
      setCurrentLineKey(k);
      if (props.updateLineParams) {
        props.updateLineParams(line);
        console.log('updated line parameters: ', props.lineData);
      }
    }
    setShowLineConfig(true);
  }

  if (props.lineData) {
    overflows.push(
      <LineKeyDropdown
        key="key dropdown"
        lines={props.lineData}
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
    const selection = props.selections?.find((s) => s.id === i);
    if (selection !== undefined) {
      setCurrentSelectionID(i);
      if (props.updateSelections) {
        props.updateSelections(selection);
        console.log('updated selections: ', props.selections);
      }
    }
    setShowSelectionConfig(true);
  }

  if (props.selections) {
    overflows.push(
      <SelectionIDDropdown
        key="ID dropdown"
        selections={props.selections}
        selectionID={currentSelectionID}
        onSelectionIDChange={onSelectionIDChange}
      />
    );
  }

  if (
    props.selections &&
    props.selections.length > 0 &&
    props.updateSelections
  ) {
    overflows.push(
      <ClearSelectionsBtn
        key="Clear all selections"
        selections={props.selections as BaseSelection[]}
        updateSelections={props.updateSelections}
        currentSelectionID={currentSelectionID}
        updateCurrentSelectionID={setCurrentSelectionID}
        disabled={!(props.batonProps?.hasBaton ?? true)}
      ></ClearSelectionsBtn>
    );
  }

  return (
    <Toolbar overflowChildren={overflows}>
      {props.mode && props.setMode ? (
        <InteractionModeToggle
          key="Interaction toggle"
          value={props.mode}
          onModeChange={props.setMode}
          hasBaton={props.batonProps?.hasBaton ?? true}
        />
      ) : null}
      <Separator key="Interaction separator" />
      {bareModals}
      selectionConfig &&
      {<Fragment key="Selection config">{selectionConfig}</Fragment>}
      lineConfig &&
      {<Fragment key="Line config">{lineConfig}</Fragment>}
      {props.children}
    </Toolbar>
  );
}

export type { PlotToolbarProps };
export default PlotToolbar;
