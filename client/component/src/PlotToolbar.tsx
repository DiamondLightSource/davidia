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
import type { IIconType } from './Modal';
import Modal from './Modal';
import SelectionTypeDropdown from './SelectionTypeDropdown';
import type { SelectionBase, SelectionType } from './selections/utils';
import SelectionConfig from './SelectionConfig';
import SelectionIDDropdown from './SelectionIDDropdown';
import type { BatonProps } from './AnyPlot';
import { InteractionModeType } from './utils';

/**
 * The props for the `TitleConfigModal` component.
 * @interface {object} TitleConfigModalProps
 * @member {string} title - The modal title.
 * @member {IIconType} [icon] - The modal icon.
 * @member {string} [label] - The label.
 * @member {(value: string) => void} [setLabel] - Handles setting of label.
 */
interface TitleConfigModalProps {
  title: string;
  icon?: IIconType;
  label?: string;
  setLabel: (value: string) => void;
}

/**
 *
 * Renders configuration options for plot title.
 * @param {TitleConfigModalProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
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
 * The props for the `PlotToolbar` component.
 * @param {boolean} showGrid - If the grid should be shown.
 * @param {() => void} toggleShowGrid - Toggles the grid.
 * @param {string} title - The title.
 * @param {(t:string) => void} setTitle - A function that sets the title.
 * @param {string} [mode] - The mode.
 * @param {(m:string) => void} [setMode] - An optional function that sets the mode.
 * @param {Domain} [xDomain] - A domain value for the x-axis.
 * @param {CustomDomain} [xCustomDomain] - A custom domain value for the x-axis.
 * @param {(d: CustomDomain) => void} [setXCustomDomain] - A function that sets the custom domain value for the x-axis.
 * @param {string} xLabel - The label for the x-axis.
 * @param {(l: string) => void} setXLabel - A function that sets the label for the x-axis.
 * @param {AxisScaleType} [xScaleType] - An axis scale type for the x-axis.
 * @param {(s: AxisScaleType) => void} [setXScaleType] - An optional function that sets the axis scale type for the x-axis.
 * @param {Domain} [yDomain] - A domain value for the y-axis.
 * @param {CustomDomain} [yCustomDomain] - A custom domain value for the y-axis.
 * @param {(d: CustomDomain) => void} [setYCustomDomain] - A function that sets the custom domain value for the y-axis.
 * @param {string} yLabel - The label for the y-axis.
 * @param {(l: string) => void} setYLabel - Function that sets the label for the y-axis.
 * @param {BatonProps} batonProps - The baton properties.
 * @param {AxisScaleType} [yScaleType] - Axis scale type for the y-axis.
 * @param {(s: AxisScaleType) => void} [setYScaleType] - A function that sets the axis scale type for the y-axis.
 * @param {Aspect} [aspect] - An aspect value.
 * @param {(a: Aspect) => void} [setAspect] - A function that sets the aspect value.
 * @param {SelectionType} [selectionType] - Selection type.
 * @param {(s: SelectionType) => void} [setSelectionType] - Function that sets the selection type.
 * @param {Domain} [dDomain] - Domain value for the d-axis.
 * @param {CustomDomain} [dCustomDomain] - Custom domain value for the d-axis.
 * @param {(d: CustomDomain) => void} [setDCustomDomain] - Sets the custom domain value for the d-axis.
 * @param {TypedArray} [values] - Values.
 * @param {ColorScaleType} [dScaleType] - The color scale type for the d-axis.
 * @param {(s: ColorScaleType) => void} [setDScaleType] - Sets the color scale type for the d-axis.
 * @param {ColorMap} [colourMap] - The color map.
 * @param {(c: ColorMap) => void} [setColourMap] - A function that sets the color map.
 * @param {boolean} invertColourMap - Whether to invert the color map.
 * @param {() => void} toggleInvertColourMap - A function that toggles the color map inversion.
 * @param {SelectionBase[]} [selections] - Selections.
 * @param {(s: SelectionBase | null, b?: boolean, c?: boolean ) => void} [updateSelections] - A function that updates the selections.
 * @param {reactNode} [children] - Any child components.
 */
interface PlotToolbarProps {
  showGrid: boolean;
  toggleShowGrid: () => void;
  title: string;
  setTitle: (t: string) => void;
  mode?: string;
  setMode?: (m: string) => void;
  xDomain?: Domain;
  xCustomDomain?: CustomDomain;
  setXCustomDomain?: (d: CustomDomain) => void;
  xLabel: string;
  setXLabel: (l: string) => void;
  xScaleType?: AxisScaleType;
  setXScaleType?: (s: AxisScaleType) => void;
  yDomain?: Domain;
  yCustomDomain?: CustomDomain;
  setYCustomDomain?: (d: CustomDomain) => void;
  yLabel: string;
  setYLabel: (l: string) => void;
  batonProps: BatonProps;
  yScaleType?: AxisScaleType;
  setYScaleType?: (s: AxisScaleType) => void;
  aspect?: Aspect;
  setAspect?: (a: Aspect) => void;
  selectionType?: SelectionType;
  setSelectionType?: (s: SelectionType) => void;
  dDomain?: Domain;
  dCustomDomain?: CustomDomain;
  setDCustomDomain?: (d: CustomDomain) => void;
  values?: TypedArray;
  dScaleType?: ColorScaleType;
  setDScaleType?: (s: ColorScaleType) => void;
  colourMap?: ColorMap;
  setColourMap?: (c: ColorMap) => void;
  invertColourMap?: boolean;
  toggleInvertColourMap?: () => void;
  selections?: SelectionBase[];
  updateSelections?: (
    s: SelectionBase | null,
    b?: boolean,
    c?: boolean
  ) => void;
  children?: ReactNode;
}

/**
 *
 * Renders a plot toolbar.
 * @param {PlotToolbarProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function PlotToolbar(props: PlotToolbarProps) {
  const firstSelection =
    props.selections && props.selections.length > 0
      ? props.selections[props.selections.length - 1].id
      : null;
  const [currentSelectionID, setCurrentSelectionID] = useState<string | null>(
    firstSelection
  );
  const [showSelectionConfig, setShowSelectionConfig] = useState(false);

  /**
   *
   * Sets fixed and asDashed properties of selection to true.
   * @param {SelectionBase} s - The selection to modify.
   */
  function enableSelection(s: SelectionBase) {
    s.fixed = true;
    s.asDashed = true;
  }

  /**
   *
   * Sets fixed and asDashed properties of selection to false.
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
      hasBaton: props.batonProps.hasBaton,
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
      values: props.values,
    });
    a.forEach((m) => {
      if (m) bareModals.push(m);
    });
    bareModals.push(<Separator key="Colour mapping separator" />);
  }

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

  /**
   *
   * Sets fixed and asDashed properties of selection to true.
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
        disabled={!props.batonProps.hasBaton}
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
          hasBaton={props.batonProps.hasBaton}
        />
      ) : null}
      <Separator key="Interaction separator" />
      {bareModals}
      selectionConfig &&
      {<Fragment key="Selection config">{selectionConfig}</Fragment>}
      {props.children}
    </Toolbar>
  );
}

export type { PlotToolbarProps };
export default PlotToolbar;
