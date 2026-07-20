import {
  AXIS_SCALE_TYPES,
  COLOR_SCALE_TYPES,
  Separator,
  Toolbar,
  type AxisScaleType,
  type ColorScaleType,
  ToggleBtn,
} from '@h5web/lib';
import {
  Fragment,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { BsCardHeading } from 'react-icons/bs';
import { MdGridOn, MdOutlineShapeLine } from 'react-icons/md';
import { TbAxisX, TbAxisY, TbGridDots } from 'react-icons/tb';

import AspectConfigModal from './AspectConfigModal';
import AxisConfigModal from './AxisConfigModal';
import { BatonConfigModal } from './BatonConfigModal';
import ClearSelectionsBtn from './ClearSelectionsBtn';
import InteractionModeToggle from './InteractionModeToggle';
import LabelledInput from './LabelledInput';
import LineConfig from './LineConfig';
import LineKeyDropdown from './LineKeyDropdown';
import type { IIconType } from './Modal';
import Modal from './Modal';
import SelectionTypeDropdown from './SelectionTypeDropdown';
import {
  undashSelection,
  dashSelection,
  toSelectionType,
  SelectionType,
} from './selections/utils';
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

/**
 * Render a plot toolbar.
 * @param {Props} props - inner children
 * @returns {JSX.Element} The rendered component.
 */
function PlotToolbar(props: PropsWithChildren): React.JSX.Element {
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

  if (firstSelection && currentSelectionID === null) {
    console.log('Setting first selection', firstSelection);
    setCurrentSelectionID(firstSelection);
  }

  const [showSelectionConfig, setShowSelectionConfig] = useState(false);
  const [showLineConfig, setShowLineConfig] = useState(false);

  const hasBaton = value.batonProps.hasBaton;
  const selectBaton = canSelect && hasBaton;

  if (canSelect) {
    selections.map((s) => undashSelection(s));
    if (currentSelectionID === null) {
      if (selections.length > 0) {
        const last = selections[selections.length - 1];
        console.log('Setting current selection', last.id);
        setCurrentSelectionID(last.id);
        if (showSelectionConfig) {
          dashSelection(last);
        }
      }
    } else if (showSelectionConfig) {
      const selection = selections.find((s) => s.id === currentSelectionID);
      if (selection) {
        dashSelection(selection);
      }
    }
  }

  const isLine = plotType === 'Line';
  const isHeatmap = plotType === 'Heatmap';
  const hasAspect = isHeatmap || plotType === 'Image';
  const isSurface = plotType === 'Surface';
  const isScatter = plotType === 'Scatter';
  const showColourMap = isScatter || isHeatmap || isSurface;

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
    <ToggleBtn
      key="Grid toggle"
      label="Grid toggle"
      Icon={MdGridOn}
      value={value.showGrid}
      onToggle={value.toggleShowGrid}
    />,
    BatonConfigModal({ ...value.batonProps }),
  ];

  const bareModals: React.JSX.Element[] = [];
  const dropdownOptions = useMemo(() => {
    const selectionOptions = value.selectionOptions;
    if (selectionOptions === undefined) {
      return undefined;
    }
    return Object.keys(selectionOptions).map((k) => toSelectionType(k));
  }, [value.selectionOptions]);

  const canAddSelection =
    dropdownOptions === undefined || dropdownOptions.length !== 0;

  let selectionType = value.selectionType;
  if (canSelect && value.selectionType !== undefined) {
    if (
      selectionType === SelectionType.unknown &&
      dropdownOptions === undefined
    ) {
      selectionType = SelectionType.line;
    }
    if (canAddSelection) {
      bareModals.push(
        <SelectionTypeDropdown
          key="Selection type"
          value={selectionType}
          onSelectionTypeChange={value.setSelectionType}
          disabled={value.mode !== InteractionModeType.selectRegion}
          options={dropdownOptions}
        />
      );
    }
  }

  useEffect(() => {
    if (canAddSelection) {
      value.setSelectionType(selectionType);
    }
  }, [canAddSelection, selectionType, value]);

  const allLineParams = value.allLineParams;
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

  bareModals.push(
    <ToggleBtn
      key="show points"
      label="Show points"
      Icon={TbGridDots}
      iconOnly
      value={value.showPoints}
      onToggle={value.toggleShowPoints}
      hidden={!isSurface}
    />
  );
  if (isSurface) {
    bareModals.push(<Separator key="Show point separator" />);
  }

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
      histogramGetter: value.histogramGetter,
      scatterPointSize: isScatter ? value.scatterPointSize : undefined,
      setScatterPointSize: value.setScatterPointSize,
      hasBaton,
      hideToggle: !showColourMap,
    })
  );
  if (showColourMap) {
    bareModals.push(<Separator key="Colour mapping separator" />);
  }

  const moreOverflows = [];
  if (allLineParams.size) {
    console.log('Add line key dropdown', [...allLineParams.keys()]);
    moreOverflows.push(
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
          }
        }
        setShowSelectionConfig(true);
      }
    },
    [canSelect, selections, updateSelection]
  );

  if (canSelect && selections.length > 0) {
    moreOverflows.push(
      <SelectionIDDropdown
        key="ID dropdown"
        selections={selections}
        selectionID={currentSelectionID}
        onSelectionIDChange={onSelectionIDChange}
      />
    );
    moreOverflows.push(
      <ClearSelectionsBtn
        key="Clear all selections"
        updateSelection={updateSelection}
        updateCurrentSelectionID={setCurrentSelectionID}
        disabled={!selectBaton}
      />
    );
  }

  return (
    <Toolbar overflowChildren={overflows.concat(moreOverflows)}>
      <InteractionModeToggle
        key="Interaction toggle"
        value={value.mode}
        onModeChange={value.setMode}
        hasBaton={selectBaton}
        canSelect={canAddSelection}
      />
      {canSelect && canAddSelection && (
        <Separator key="Interaction separator" />
      )}
      {bareModals}
      {canSelect && (
        <Fragment key="Selection config">
          <SelectionConfig
            selections={selections}
            updateSelection={updateSelection}
            currentSelectionID={currentSelectionID}
            updateCurrentSelectionID={setCurrentSelectionID}
            icon={MdOutlineShapeLine as IIconType}
            domain={value.dDomain}
            customDomain={value.dCustomDomain}
            showSelectionConfig={showSelectionConfig}
            updateShowSelectionConfig={setShowSelectionConfig}
            hasBaton={selectBaton}
          />
        </Fragment>
      )}
      {isLine && (
        <Fragment key="Line config">
          <LineConfig
            allLineParams={allLineParams}
            updateLineParams={value.updateLineParams}
            currentLineKey={value.currentLineKey}
            showLineConfig={showLineConfig}
            updateShowLineConfig={setShowLineConfig}
            hasBaton={hasBaton}
          />
        </Fragment>
      )}
      {children}
    </Toolbar>
  );
}

export interface AnyToolbarProps {
  /** Inner children to add to plot toolbar */
  extraChildren?: React.ReactNode;
}

/**
 * Toolbar component for any plot
 */
export function AnyToolbar(props: PropsWithChildren<AnyToolbarProps>) {
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
