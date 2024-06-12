import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useToggle } from '@react-hookz/web';
import {
  Aspect,
  AxisScaleType,
  ColorMap,
  ColorScaleType,
  CustomDomain,
  Domain,
  ScaleType,
} from '@h5web/lib';

import type { BatonProps } from './models';
import { InteractionModeType } from './utils';
import type { AnyPlotVisProps } from './AnyPlot';
import type { AddSelectionHandler, SelectionBase } from './selections/utils';
import { SelectionType, useSelections } from './selections/utils';
import { TypedArray } from 'ndarray';
import { LineData } from './LinePlot';

/**
 * Value for a `PlotCustomization` context.
 */
interface PlotCustomizationContextValue {
  /** Children to customize toolbar */
  customToolbarChildren?: React.ReactNode;
  /** If the grid should be shown */
  showGrid: boolean;
  /** Toggles the grid */
  toggleShowGrid: () => void;
  /** The title */
  title: string;
  /** A function that sets the title */
  setTitle: (t: string) => void;
  /** The mode */
  mode: InteractionModeType;
  /** An optional function that sets the mode */
  setMode?: (m: InteractionModeType) => void;
  /** A domain value for the x-axis */
  xDomain: Domain;
  /** A custom domain value for the x-axis */
  xCustomDomain: CustomDomain;
  /** A function that sets the custom domain value for the x-axis */
  setXCustomDomain?: (d: CustomDomain) => void;
  /** The label for the x-axis */
  xLabel: string;
  /** A function that sets the label for the x-axis */
  setXLabel: (l: string) => void;
  /** An axis scale type for the x-axis */
  xScaleType?: AxisScaleType;
  /** An optional function that sets the axis scale type for the x-axis */
  setXScaleType?: (s: AxisScaleType) => void;
  /** A domain value for the y-axis */
  yDomain: Domain;
  /** A custom domain value for the y-axis */
  yCustomDomain: CustomDomain;
  /** A function that sets the custom domain value for the y-axis */
  setYCustomDomain?: (d: CustomDomain) => void;
  /** The label for the y-axis */
  yLabel: string;
  /** A function that sets the label for the y-axis */
  setYLabel: (l: string) => void;
  /** The baton properties */
  batonProps?: BatonProps;
  /** An axis scale type for the y-axis */
  yScaleType?: AxisScaleType;
  /** A function that sets the axis scale type for the y-axis */
  setYScaleType?: (s: AxisScaleType) => void;
  /** An aspect value */
  aspect?: Aspect;
  /** A function that sets the aspect value */
  setAspect?: (a: Aspect) => void;
  /** A selection type */
  selectionType?: SelectionType;
  /** A function that sets the selection type */
  setSelectionType?: (s: SelectionType) => void;
  /** A domain value for the d-axis */
  dDomain: Domain;
  /** A custom domain value for the d-axis */
  dCustomDomain: CustomDomain;
  /** A function that sets the custom domain value for the d-axis */
  setDCustomDomain?: (d: CustomDomain) => void;
  /** Data for the d-axis */
  dData?: TypedArray;
  /** A color scale type for the d-axis */
  dScaleType?: ColorScaleType;
  /** A function that sets the color scale type for the d-axis */
  setDScaleType?: (s: ColorScaleType) => void;
  /** A color map */
  colourMap?: ColorMap;
  /** A function that sets the color map */
  setColourMap?: (c: ColorMap) => void;
  /** Whether to invert the color map */
  invertColourMap?: boolean;
  /** A function that toggles the color map inversion */
  toggleInvertColourMap?: () => void;
  /** Selections */
  selections: SelectionBase[];
  /** A function that updates the selections */
  updateSelection?: AddSelectionHandler;
  /** An array of line data */
  lineData: LineData[];
  /** A function to update parameters in a line */
  updateLineParams?: (p: LineData) => void;
  /** The size of scatter data points. */
  scatterPointSize?: number;
  /** A function that updates the selections */
  setScatterPointSize?: (p: number) => void;
  /** Whether to show points on surface */
  showPoints?: boolean;
  /** A function that toggles the points */
  toggleShowPoints?: () => void;
}

const PlotCustomizationContext = createContext<PlotCustomizationContextValue>(
  {} as PlotCustomizationContextValue
);

/**
 * @returns context for customizing a plot
 */
// eslint-disable-next-line react-refresh/only-export-components
export function usePlotCustomizationContext() {
  return useContext(PlotCustomizationContext);
}

export function PlotCustomizationContextProvider(
  props: PropsWithChildren<AnyPlotVisProps>
) {
  const isHeatmap = 'heatmapScale' in props;
  const initHMScale =
    isHeatmap && props.heatmapScale ? props.heatmapScale : ScaleType.Linear;
  const initAspect = isHeatmap && props.aspect ? props.aspect : 'equal';
  const initColourMap = isHeatmap && props.colourMap ? props.colourMap : 'Warm';

  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState(props.plotConfig.title ?? '');
  const [mode, setMode] = useState<InteractionModeType>(
    InteractionModeType.panAndWheelZoom
  );
  const [selectionType, setSelectionType] = useState<SelectionType>(
    SelectionType.line
  );
  const [xCustomDomain, setXCustomDomain] = useState<CustomDomain>([
    null,
    null,
  ]);
  const [yCustomDomain, setYCustomDomain] = useState<CustomDomain>([
    null,
    null,
  ]);
  const [xLabel, setXLabel] = useState(props.plotConfig.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.plotConfig.yLabel ?? 'y axis');
  const [xScaleType, setXScaleType] = useState<AxisScaleType>(
    props.plotConfig.xScale ?? ScaleType.Linear
  );
  const [yScaleType, setYScaleType] = useState<AxisScaleType>(
    props.plotConfig.yScale ?? ScaleType.Linear
  );

  const [dCustomDomain, setDCustomDomain] = useState<CustomDomain>([
    null,
    null,
  ]);

  const [dScaleType, setDScaleType] = useState<ColorScaleType>(initHMScale);
  const [aspect, setAspect] = useState<Aspect>(initAspect);
  const [colourMap, setColourMap] = useState<ColorMap>(initColourMap);

  const [invertColourMap, toggleInvertColourMap] = useToggle();
  const [showPoints, toggleShowPoints] = useToggle();

  const basicValue = {
    customToolbarChildren: props.customToolbarChildren,
    showGrid,
    toggleShowGrid,
    title,
    setTitle,
    mode,
    setMode,
    xLabel,
    setXLabel,
    yLabel,
    setYLabel,
    batonProps: props.batonProps,
    xScaleType,
    setXScaleType,
    yScaleType,
    setYScaleType,
    xDomain: [0, 1] as Domain,
    xCustomDomain,
    setXCustomDomain,
    yDomain: [0, 1] as Domain,
    yCustomDomain,
    setYCustomDomain,
    dDomain: [0, 1] as Domain,
    dCustomDomain: [0, 1] as Domain,
    selectionType,
    setSelectionType,
    selections: [],
    lineData: [] as LineData[],
  };

  const isSurfacePlot = 'surfaceScale' in props;
  const initSelections = useMemo(() => {
    return isSurfacePlot ? [] : props.selections ?? [];
  }, [isSurfacePlot, props]);
  const { selections, addSelection, setSelections } =
    useSelections(initSelections);

  useEffect(() => {
    setSelections(initSelections);
  }, [setSelections, initSelections]);

  let updateSelection: AddSelectionHandler = null;
  if (!isSurfacePlot && props.addSelection !== null) {
    updateSelection = props.addSelection ?? addSelection;
  }

  let finalValue: PlotCustomizationContextValue;
  if ('lineData' in props) {
    /*
        showGrid={showGrid}
        toggleShowGrid={toggleShowGrid}
        title={title}
        setTitle={setTitle}
        mode={mode}
        setMode={setMode}
        xLabel={xLabel}
        setXLabel={setXLabel}
        xScaleType={xScaleType}
        setXScaleType={setXScaleType}
        yLabel={yLabel}
        setYLabel={setYLabel}
        batonProps={props.batonProps}
        yScaleType={yScaleType}
        setYScaleType={setYScaleType}
        selectionType={selectionType}
        setSelectionType={setSelectionType}
        selections={props.selections}
        updateSelection={props.addSelection}

        xCustomDomain={xCustomDomain}
        setXCustomDomain={setXCustomDomain}
        yCustomDomain={yCustomDomain}
        setYCustomDomain={setYCustomDomain}

        xDomain={props.xDomain}
        yDomain={props.yDomain}
        lineData={props.lineData}
        updateLineParams={props.updateLineParams}
    */
    finalValue = {
      ...basicValue,
      selections,
      updateSelection,

      xDomain: props.xDomain,
      yDomain: props.yDomain,
      lineData: props.lineData,
      updateLineParams: props.updateLineParams,
    };
  } else if (isHeatmap) {
    /*
        showGrid={showGrid}
        toggleShowGrid={toggleShowGrid}
        title={title}
        setTitle={setTitle}
        mode={mode}
        setMode={setMode}
        xLabel={xLabel}
        setXLabel={setXLabel}
        xScaleType={xScaleType}
        setXScaleType={setXScaleType}
        yLabel={yLabel}
        setYLabel={setYLabel}
        batonProps={props.batonProps}
        yScaleType={yScaleType}
        setYScaleType={setYScaleType}

        aspect={aspect}
        setAspect={setAspect}
        selectionType={selectionType}
        setSelectionType={setSelectionType}

        dDomain={props.domain}
        dCustomDomain={customDomain}
        setDCustomDomain={setCustomDomain}
        dData={props.values.data}
        dScaleType={heatmapScaleType}
        setDScaleType={setHeatmapScaleType}
        colourMap={colourMap}
        setColourMap={setColourMap}
        invertColourMap={invertColourMap}
        toggleInvertColourMap={toggleInvertColourMap}
        selections={props.selections}
        updateSelection={props.addSelection}
    */
    finalValue = {
      ...basicValue,
      aspect,
      setAspect,
      dDomain: props.domain,
      dCustomDomain,
      setDCustomDomain,
      dData: props.values.data,
      dScaleType,
      setDScaleType,
      colourMap,
      setColourMap,
      invertColourMap,
      toggleInvertColourMap,
      selections,
      updateSelection,
    };
    console.log('Selections are', props.selections);
  } else if ('values' in props) {
    // RGB image
    /*
        showGrid={showGrid}
        toggleShowGrid={toggleShowGrid}
        title={title}
        setTitle={setTitle}
        mode={mode}
        setMode={setMode}
        xLabel={xLabel}
        setXLabel={setXLabel}
        yLabel={yLabel}
        setYLabel={setYLabel}
        batonProps={props.batonProps}
        aspect={aspect}
        setAspect={setAspect}
        selectionType={selectionType}
        setSelectionType={setSelectionType}
        selections={props.selections}
        updateSelection={props.addSelection}

        dData={props.values.data}
    */
    finalValue = {
      ...basicValue,
      dData: props.values.data,
      selections,
      updateSelection,
    };
  } else if ('pointValues' in props) {
    // scatter plot
    /*
        showGrid={showGrid}
        toggleShowGrid={toggleShowGrid}
        title={title}
        setTitle={setTitle}
        mode={mode}
        setMode={setMode}
        xLabel={xLabel}
        setXLabel={setXLabel}
        xScaleType={xScaleType}
        setXScaleType={setXScaleType}
        yLabel={yLabel}
        setYLabel={setYLabel}
        batonProps={props.batonProps}
        yScaleType={yScaleType}
        setYScaleType={setYScaleType}

        dDomain={props.domain}
        dCustomDomain={dCustomDomain}
        setDCustomDomain={setDCustomDomain}
        dData={props.pointValues.data}
        colourMap={colourMap}
        setColourMap={setColourMap}
        invertColourMap={invertColourMap}
        toggleInvertColourMap={toggleInvertColourMap}
        selectionType={selectionType}
        setSelectionType={setSelectionType}

        selections={props.selections}
        updateSelection={props.addSelection}

        scatterPointSize={props.pointSize}
        setScatterPointSize={props.setPointSize}
    */
    finalValue = {
      ...basicValue,
      dDomain: props.domain,
      dCustomDomain,
      setDCustomDomain,
      dData: props.pointValues.data,
      colourMap,
      setColourMap,
      invertColourMap,
      toggleInvertColourMap,
      selections,
      updateSelection,
      scatterPointSize: props.pointSize,
      setScatterPointSize: props.setPointSize,
    };
  } else if (isSurfacePlot) {
    // surface
    /*
        showGrid={showGrid}
        toggleShowGrid={toggleShowGrid}
        title={title}
        setTitle={setTitle}
        xLabel={xLabel}
        setXLabel={setXLabel}
        yLabel={yLabel}
        setYLabel={setYLabel}
        batonProps={props.batonProps}
        dDomain={props.domain}
        dCustomDomain={customDomain}
        setDCustomDomain={setCustomDomain}
        dData={props.heightValues.data}
        dScaleType={surfaceScaleType}
        setDScaleType={setSurfaceScaleType}
        colourMap={colourMap}
        setColourMap={setColourMap}
        invertColourMap={invertColourMap}
        toggleInvertColourMap={toggleInvertColourMap}
    */
    finalValue = {
      ...basicValue,
      dDomain: props.domain,
      dCustomDomain,
      setDCustomDomain,
      dData: props.heightValues.data,
      dScaleType,
      setDScaleType,
      colourMap,
      setColourMap,
      invertColourMap,
      toggleInvertColourMap,
      showPoints,
      toggleShowPoints,
    };
  } else {
    finalValue = basicValue;
  }

  const contextValue = useMemo(() => {
    return { ...finalValue };
  }, [finalValue]);

  return (
    <PlotCustomizationContext.Provider value={contextValue}>
      {props.children}
    </PlotCustomizationContext.Provider>
  );
}

export type { PlotCustomizationContextValue };
