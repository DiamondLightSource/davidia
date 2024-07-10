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
  HistogramParams,
  ScaleType,
} from '@h5web/lib';

import type { BatonProps } from './models';
import { InteractionModeType } from './utils';
import type { AddSelectionHandler, SelectionBase } from './selections/utils';
import { SelectionType, useSelections } from './selections/utils';
import { LineParams, LinePlotCustomizationProps } from './LinePlot';
import { ImagePlotCustomizationProps } from './ImagePlot';
import { HeatmapPlotCustomizationProps } from './HeatmapPlot';
import { ScatterPlotCustomizationProps } from './ScatterPlot';
import { SurfacePlotCustomizationProps } from './SurfacePlot';

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
  /** Map of line parameters */
  allLineParams?: Map<string, LineParams>;
  /** Set line parameters */
  setAllLineParams: (params: Map<string, LineParams>) => void;
  /** A function to update parameters in a line */
  updateLineParams?: (key: string, params: LineParams) => void;
  /** The size of scatter data points. */
  scatterPointSize?: number;
  /** A function that updates the selections */
  setScatterPointSize?: (p: number) => void;
  /** Whether to show points on surface */
  showPoints?: boolean;
  /** A function that toggles the points */
  toggleShowPoints?: () => void;
  /** Histogram params */
  histogram?: HistogramParams;
  /** Set heatmap histogram */
  setHistogram: (histogram: HistogramParams) => void;
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

type AnyPlotCustomizationProps =
  | LinePlotCustomizationProps
  | ImagePlotCustomizationProps
  | HeatmapPlotCustomizationProps
  | ScatterPlotCustomizationProps
  | SurfacePlotCustomizationProps;

export function PlotCustomizationContextProvider(
  props: PropsWithChildren<AnyPlotCustomizationProps>
) {
  const isHeatmap = 'heatmapScale' in props;
  const initHMScale =
    isHeatmap && props.heatmapScale ? props.heatmapScale : ScaleType.Linear;
  const initAspect = isHeatmap && props.aspect ? props.aspect : 'equal';
  const initColourMap = isHeatmap && props.colourMap ? props.colourMap : 'Warm';

  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState('');
  const initTitle = props.plotConfig.title ?? '';
  useEffect(() => {
    setTitle(initTitle);
  }, [initTitle]);

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
  const [xLabel, setXLabel] = useState('');
  const initXLabel = props.plotConfig.xLabel ?? 'x axis';
  useEffect(() => {
    setXLabel(initXLabel);
  }, [initXLabel]);

  const [yLabel, setYLabel] = useState('');
  const initYLabel = props.plotConfig.yLabel ?? 'y axis';
  useEffect(() => {
    setYLabel(initYLabel);
  }, [initYLabel]);

  const [xScaleType, setXScaleType] = useState<AxisScaleType>(ScaleType.Linear);
  const initXScaleType = props.plotConfig.xScale ?? ScaleType.Linear;
  useEffect(() => {
    setXScaleType(initXScaleType);
  }, [initXScaleType]);

  const [yScaleType, setYScaleType] = useState<AxisScaleType>(ScaleType.Linear);
  const initYScaleType = props.plotConfig.yScale ?? ScaleType.Linear;
  useEffect(() => {
    setYScaleType(initYScaleType);
  }, [initYScaleType]);

  const [dCustomDomain, setDCustomDomain] = useState<CustomDomain>([
    null,
    null,
  ]);

  const [dScaleType, setDScaleType] = useState<ColorScaleType>(
    ScaleType.Linear
  );
  useEffect(() => {
    setDScaleType(initHMScale);
  }, [initHMScale]);

  const [aspect, setAspect] = useState<Aspect>('equal');
  useEffect(() => {
    setAspect(initAspect);
  }, [initAspect]);

  const [colourMap, setColourMap] = useState<ColorMap>('Inferno');
  useEffect(() => {
    setColourMap(initColourMap);
  }, [initColourMap]);

  const [invertColourMap, toggleInvertColourMap] = useToggle();
  const [showPoints, toggleShowPoints] = useToggle();

  const [allLineParams, setAllLineParams] = useState<Map<string, LineParams>>(
    new Map()
  );

  const [histogram, setHistogram] = useState<HistogramParams>();
  const [scatterPointSize, setScatterPointSize] = useState<number>(10);

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
    setAllLineParams,
    setHistogram,
  };

  const isSurfacePlot = 'surfaceScale' in props;
  const initSelections = useMemo(() => {
    return isSurfacePlot ? [] : (props.selections ?? []);
  }, [isSurfacePlot, props]);
  const { selections, addSelection, setSelections } = useSelections([]);
  useEffect(() => {
    setSelections(initSelections);
  }, [setSelections, initSelections]);

  let updateSelection: AddSelectionHandler = null;
  if (!isSurfacePlot && props.addSelection !== null) {
    updateSelection = props.addSelection ?? addSelection;
  }

  const updateLineParams = (key: string, lineParams: LineParams) => {
    const newLineParams = new Map(allLineParams);
    newLineParams.set(key, { ...lineParams });
    setAllLineParams(newLineParams);
  };

  const isScatterPlot = 'pointSize' in props;
  const initPointSize =
    isScatterPlot && props.pointSize ? props.pointSize : scatterPointSize;
  useEffect(() => {
    if (isScatterPlot) {
      setScatterPointSize(initPointSize);
    }
  }, [initPointSize, isScatterPlot]);

  const updateScatterPointSize =
    isScatterPlot && props.setPointSize
      ? props.setPointSize
      : (newSize: number) => {
          setScatterPointSize(newSize);
        };

  let finalValue: PlotCustomizationContextValue;
  if ('updateLineParams' in props) {
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
      allLineParams,
      updateLineParams: props.updateLineParams ?? updateLineParams,
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
      dScaleType,
      setDScaleType,
      colourMap,
      setColourMap,
      invertColourMap,
      toggleInvertColourMap,
      selections,
      updateSelection,
      histogram,
    };
    console.log('Selections are', props.selections);
  } else if ('aspect' in props) {
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
      selections,
      updateSelection,
    };
  } else if (isScatterPlot) {
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
      colourMap,
      setColourMap,
      invertColourMap,
      toggleInvertColourMap,
      selections,
      updateSelection,
      histogram,
      scatterPointSize,
      setScatterPointSize: updateScatterPointSize,
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
