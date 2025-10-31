import {
  PropsWithChildren,
  createContext,
  useCallback,
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

import { defaultBatonProps, type BatonProps } from './models';
import { InteractionModeType } from './utils';
import type {
  SelectionBase,
  SelectionHandler,
  SelectionOptions,
} from './selections/utils';
import {
  SelectionType,
  toSelectionType,
  useSelections,
} from './selections/utils';
import { LineParams, LinePlotCustomizationProps } from './LinePlot';
import { ImagePlotCustomizationProps } from './ImagePlot';
import { HeatmapPlotCustomizationProps } from './HeatmapPlot';
import { ScatterPlotCustomizationProps } from './ScatterPlot';
import { SurfacePlotCustomizationProps } from './SurfacePlot';

/**
 * Plot type available
 */
export type PlotType = 'Line' | 'Heatmap' | 'Image' | 'Scatter' | 'Surface';

/**
 * Value for a `PlotCustomization` context.
 */
export interface PlotCustomizationContextValue {
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
  setMode: (m: InteractionModeType) => void;
  /** A domain value for the x-axis */
  xDomain: Domain;
  /** A custom domain value for the x-axis */
  xCustomDomain: CustomDomain;
  /** A function that sets the custom domain value for the x-axis */
  setXCustomDomain: (d: CustomDomain) => void;
  /** The label for the x-axis */
  xLabel: string;
  /** A function that sets the label for the x-axis */
  setXLabel: (l: string) => void;
  /** An axis scale type for the x-axis */
  xScaleType: AxisScaleType;
  /** An optional function that sets the axis scale type for the x-axis */
  setXScaleType: (s: AxisScaleType) => void;
  /** A domain value for the y-axis */
  yDomain: Domain;
  /** A custom domain value for the y-axis */
  yCustomDomain: CustomDomain;
  /** A function that sets the custom domain value for the y-axis */
  setYCustomDomain: (d: CustomDomain) => void;
  /** The label for the y-axis */
  yLabel: string;
  /** A function that sets the label for the y-axis */
  setYLabel: (l: string) => void;
  /** The baton properties */
  batonProps: BatonProps;
  /** An axis scale type for the y-axis */
  yScaleType: AxisScaleType;
  /** A function that sets the axis scale type for the y-axis */
  setYScaleType: (s: AxisScaleType) => void;
  /** An aspect value */
  aspect: Aspect;
  /** A function that sets the aspect value */
  setAspect: (a: Aspect) => void;
  /** Selection upper limit (on current type) */
  selectionMax: number;
  /** A selection type */
  selectionType: SelectionType;
  /** A function that sets the selection type */
  setSelectionType: (s: SelectionType) => void;
  /** A domain value for the d-axis */
  dDomain: Domain;
  /** A custom domain value for the d-axis */
  dCustomDomain: CustomDomain;
  /** A function that sets the custom domain value for the d-axis */
  setDCustomDomain: (d: CustomDomain) => void;
  /** A color scale type for the d-axis */
  dScaleType: ColorScaleType;
  /** A function that sets the color scale type for the d-axis */
  setDScaleType: (s: ColorScaleType) => void;
  /** A color map */
  colourMap: ColorMap;
  /** A function that sets the color map */
  setColourMap: (c: ColorMap) => void;
  /** Whether to invert the color map */
  invertColourMap: boolean;
  /** A function that toggles the color map inversion */
  toggleInvertColourMap: () => void;
  /** Selection options */
  selectionOptions?: SelectionOptions;
  /** Selections */
  selections: SelectionBase[];
  /** A function that sets the selections */
  setSelections: (s: SelectionBase[]) => void;
  /** A function that updates the selections */
  updateSelection: SelectionHandler;
  /** Map of line parameters */
  allLineParams: Map<string, LineParams>;
  /** Set line parameters */
  setAllLineParams: (params: Map<string, LineParams>) => void;
  /** A function to update parameters in a line */
  updateLineParams: (key: string, params: LineParams) => void;
  /** current line key */
  currentLineKey: string | null;
  /** A function that sets current line key */
  setCurrentLineKey: (k: string) => void;
  /** The size of scatter data points. */
  scatterPointSize: number;
  /** A function that updates the selections */
  setScatterPointSize: (p: number) => void;
  /** Whether to show points on surface */
  showPoints: boolean;
  /** A function that toggles the points */
  toggleShowPoints: () => void;
  /** Histogram params */
  histogram?: HistogramParams;
  /** Set heatmap histogram */
  setHistogram: (histogram: HistogramParams) => void;
  /** Can select */
  canSelect: boolean;
  /** Type of plot */
  plotType: PlotType;
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

export interface AnyPlotCustomizationProps
  extends LinePlotCustomizationProps,
    ImagePlotCustomizationProps,
    HeatmapPlotCustomizationProps,
    ScatterPlotCustomizationProps,
    SurfacePlotCustomizationProps {}

const defaultDomain = [0, 1] as Domain;

export function PlotCustomizationContextProvider(
  props: PropsWithChildren<AnyPlotCustomizationProps>
) {
  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<InteractionModeType>(
    InteractionModeType.panAndWheelZoom
  );
  const [selectionType, setSelectionType] = useState<SelectionType>(
    SelectionType.unknown
  );
  const [selectionMax, setSelectionMax] = useState<number>(0);
  const [xCustomDomain, setXCustomDomain] = useState<CustomDomain>([
    null,
    null,
  ]);
  const [yCustomDomain, setYCustomDomain] = useState<CustomDomain>([
    null,
    null,
  ]);
  const [xLabel, setXLabel] = useState('');
  const [yLabel, setYLabel] = useState('');
  const [xScaleType, setXScaleType] = useState<AxisScaleType>(ScaleType.Linear);
  const [yScaleType, setYScaleType] = useState<AxisScaleType>(ScaleType.Linear);
  const [dCustomDomain, setDCustomDomain] = useState<CustomDomain>([
    null,
    null,
  ]);
  const [dScaleType, setDScaleType] = useState<ColorScaleType>(
    ScaleType.Linear
  );
  const [aspect, setAspect] = useState<Aspect>('equal');
  const [colourMap, setColourMap] = useState<ColorMap>('Greys');
  const [invertColourMap, toggleInvertColourMap] = useToggle();
  const [showPoints, toggleShowPoints] = useToggle();

  const [allLineParams, setAllLineParams] = useState<Map<string, LineParams>>(
    new Map()
  );
  const [currentLineKey, setCurrentLineKey] = useState<string | null>(null);
  const [histogram, setHistogram] = useState<HistogramParams>();
  const [scatterPointSize, setScatterPointSize] = useState<number>(10);

  useEffect(() => {
    if (props.plotConfig.title) setTitle(props.plotConfig.title);
  }, [props.plotConfig.title, setTitle]);
  useEffect(() => {
    if (props.plotConfig.xLabel) setXLabel(props.plotConfig.xLabel);
  }, [props.plotConfig.xLabel, setXLabel]);
  useEffect(() => {
    if (props.plotConfig.yLabel) setYLabel(props.plotConfig.yLabel);
  }, [props.plotConfig.yLabel, setYLabel]);
  useEffect(() => {
    if (props.plotConfig.xScale) setXScaleType(props.plotConfig.xScale);
  }, [props.plotConfig.xScale, setXScaleType]);
  useEffect(() => {
    if (props.plotConfig.yScale) setYScaleType(props.plotConfig.yScale);
  }, [props.plotConfig.yScale, setYScaleType]);
  useEffect(() => {
    const entries = Object.entries(props.selectionOptions ?? {});
    const [k, v] = entries[0] ?? [];
    if (k !== undefined && v !== undefined) {
      setSelectionType(toSelectionType(k));
      setSelectionMax(v);
    }
  }, [props.selectionOptions, setSelectionType, setSelectionMax]);

  const newSetSelectionType = useCallback(
    (t: SelectionType) => {
      setSelectionType(t);
      const selectionOptions = props.selectionOptions ?? {};
      const m = selectionOptions[t];
      if (m !== undefined) {
        setSelectionMax(m);
      }
    },
    [setSelectionType, setSelectionMax, props.selectionOptions]
  );

  const batonProps = useMemo(
    () => props.batonProps ?? defaultBatonProps,
    [props.batonProps]
  );

  const xDomain = useMemo(
    () => props.xDomain ?? defaultDomain,
    [props.xDomain]
  );
  const yDomain = useMemo(
    () => props.yDomain ?? defaultDomain,
    [props.yDomain]
  );
  const dDomain = useMemo(() => props.domain ?? defaultDomain, [props.domain]);

  let plotType: PlotType = 'Line';
  if ('values' in props) {
    plotType = props.heatmapScale ? 'Heatmap' : 'Image';
  } else if ('pointValues' in props) {
    plotType = 'Scatter';
  } else if ('heightValues' in props) {
    plotType = 'Surface';
  }
  useEffect(() => {
    if (plotType !== 'Line') {
      if (props.heatmapScale) setDScaleType(props.heatmapScale);
      if (props.surfaceScale) setDScaleType(props.surfaceScale);
      if (props.showPoints !== undefined) toggleShowPoints(props.showPoints);
      if (props.aspect !== undefined) setAspect(props.aspect);
      if (props.colourMap) setColourMap(props.colourMap);
    }
  }, [
    plotType,
    props.aspect,
    props.colourMap,
    props.heatmapScale,
    props.surfaceScale,
    props.showPoints,
    setAspect,
    setColourMap,
    setDScaleType,
    toggleShowPoints,
  ]);

  const {
    selections,
    updateSelection,
    setSelections,
    canSelect,
    enableSelect,
  } = useSelections([], props.selectionsListener);

  const isSurfacePlot = plotType === 'Surface';
  useEffect(() => {
    if (props.selections) setSelections(props.selections);
  }, [props.selections, setSelections]);

  const newUpdateSelection = useMemo(() => {
    if (isSurfacePlot) {
      enableSelect(false);
    } else {
      const propsUpdateSelection = props.updateSelection;
      enableSelect(propsUpdateSelection !== null);
      if (propsUpdateSelection) {
        return propsUpdateSelection;
      } else if (propsUpdateSelection === null) {
        // setBatonProps({ ...batonProps, hasBaton: false });
      }
    }
    return updateSelection;
  }, [enableSelect, isSurfacePlot, props.updateSelection, updateSelection]);

  const isScatterPlot = plotType === 'Scatter';
  useEffect(() => {
    if (isScatterPlot && props.pointSize !== undefined) {
      setScatterPointSize(props.pointSize);
    }
  }, [props.pointSize, isScatterPlot, setScatterPointSize]);

  const updateLineParams = useCallback(
    (key: string, lineParams: LineParams) => {
      const newLineParams = new Map(allLineParams);
      newLineParams.set(key, { ...lineParams });
      setAllLineParams(newLineParams);
    },
    [allLineParams]
  );

  const contextValue = useMemo(() => {
    return {
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
      batonProps,
      xScaleType,
      setXScaleType,
      yScaleType,
      setYScaleType,
      xDomain,
      xCustomDomain,
      setXCustomDomain,
      yDomain,
      yCustomDomain,
      setYCustomDomain,
      dDomain,
      dCustomDomain,
      setDCustomDomain,
      selectionOptions: props.selectionOptions,
      selectionMax,
      selectionType,
      setSelectionType: newSetSelectionType,
      setHistogram,
      selections,
      setSelections,
      updateSelection: newUpdateSelection,
      allLineParams,
      setAllLineParams,
      updateLineParams,
      currentLineKey,
      setCurrentLineKey,
      aspect,
      setAspect,
      dScaleType,
      setDScaleType,
      colourMap,
      setColourMap,
      invertColourMap,
      toggleInvertColourMap,
      histogram,
      scatterPointSize,
      setScatterPointSize,
      showPoints,
      toggleShowPoints,
      canSelect,
      plotType,
    };
  }, [
    allLineParams,
    aspect,
    batonProps,
    canSelect,
    colourMap,
    currentLineKey,
    dCustomDomain,
    dDomain,
    dScaleType,
    histogram,
    invertColourMap,
    mode,
    newUpdateSelection,
    newSetSelectionType,
    plotType,
    props.selectionOptions,
    scatterPointSize,
    selectionMax,
    selectionType,
    selections,
    setSelections,
    showGrid,
    showPoints,
    title,
    toggleInvertColourMap,
    toggleShowGrid,
    toggleShowPoints,
    updateLineParams,
    xCustomDomain,
    xDomain,
    xLabel,
    xScaleType,
    yCustomDomain,
    yDomain,
    yLabel,
    yScaleType,
  ]);

  return (
    <PlotCustomizationContext.Provider value={contextValue}>
      {props.children}
    </PlotCustomizationContext.Provider>
  );
}
