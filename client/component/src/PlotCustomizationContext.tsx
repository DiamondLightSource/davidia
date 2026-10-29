import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
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

import { PlotConfig, type PlotSelectionProps } from './models';
import { InteractionModeType } from './utils';
import type {
  SelectionBase,
  SelectionHandler,
  SelectionOptions,
  SelectionsEventListener,
} from './selections/utils';
import {
  SelectionType,
  toSelectionType,
  useSelections,
} from './selections/utils';
import { LineParams } from './LinePlot';
import { ImageData } from './ImagePlot';
import { HeatmapData } from './HeatmapPlot';
import { ScatterData } from './ScatterPlot';
import { SurfaceData } from './SurfacePlot';

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
  /** A function that sets the domain value for the x-axis */
  setXDomain: (d: Domain) => void;
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
  /** A function that sets the domain value for the y-axis */
  setYDomain: (d: Domain) => void;
  /** A custom domain value for the y-axis */
  yCustomDomain: CustomDomain;
  /** A function that sets the custom domain value for the y-axis */
  setYCustomDomain: (d: CustomDomain) => void;
  /** The label for the y-axis */
  yLabel: string;
  /** A function that sets the label for the y-axis */
  setYLabel: (l: string) => void;
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
  /** A function that sets the domain value for the d-axis */
  setDDomain: (d: Domain) => void;
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
  setSelections: Dispatch<SetStateAction<SelectionBase[]>>;
  /** A function that sets the selections listener */
  setSelectionsListener: (l: SelectionsEventListener) => void;
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
  /** Get heatmap histogram */
  histogramGetter?: () => HistogramParams;
  /** Update heatmap histogram getter */
  updateHistogramGetter: (getter: () => HistogramParams) => void;

  updateLineContext: (
    xDomain?: Domain,
    yDomain?: Domain,
    plotConfig?: PlotConfig
  ) => void;
  updateHeatmapContext: (data: HeatmapData, plotConfig: PlotConfig) => void;
  updateImageContext: (data: ImageData, plotConfig: PlotConfig) => void;
  updateScatterContext: (data: ScatterData, plotConfig: PlotConfig) => void;
  updateSurfaceContext: (data: SurfaceData, plotConfig: PlotConfig) => void;
  updateSelectionContext: (selectionProps: PlotSelectionProps) => void;

  /** Can select */
  canSelect: boolean;
  /** Type of plot */
  plotType: PlotType;
  /** Can edit selections */
  canEditSelections: boolean;
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

const defaultDomain = [0, 1] as Domain;
const defaultCustomDomain = [null, null] as CustomDomain;

export function PlotCustomizationContextProvider(props: PropsWithChildren) {
  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<InteractionModeType>(
    InteractionModeType.panAndWheelZoom
  );
  const [selectionType, setSelectionType] = useState<SelectionType>(
    SelectionType.unknown
  );
  const [selectionMax, setSelectionMax] = useState<number>(0);
  const [xCustomDomain, setXCustomDomain] =
    useState<CustomDomain>(defaultCustomDomain);
  const [yCustomDomain, setYCustomDomain] =
    useState<CustomDomain>(defaultCustomDomain);
  const [xLabel, setXLabel] = useState('');
  const [yLabel, setYLabel] = useState('');
  const [xScaleType, setXScaleType] = useState<AxisScaleType>(ScaleType.Linear);
  const [yScaleType, setYScaleType] = useState<AxisScaleType>(ScaleType.Linear);

  const [xDomain, setXDomain] = useState<Domain>(defaultDomain);
  const [yDomain, setYDomain] = useState<Domain>(defaultDomain);
  const [dDomain, setDDomain] = useState<Domain>(defaultDomain);
  const [dCustomDomain, setDCustomDomain] =
    useState<CustomDomain>(defaultCustomDomain);
  const [dScaleType, setDScaleType] = useState<ColorScaleType>(
    ScaleType.Linear
  );
  const [aspect, setAspect] = useState<Aspect>('equal');
  const [colourMap, setColourMap] = useState<ColorMap>('Greys');
  const [invertColourMap, toggleInvertColourMap] = useToggle();
  const [showPoints, toggleShowPoints] = useToggle(false);

  const [allLineParams, setAllLineParams] = useState<Map<string, LineParams>>(
    new Map()
  );
  const [currentLineKey, setCurrentLineKey] = useState<string | null>(null);
  const [histogramGetter, setHistogramGetter] =
    useState<() => HistogramParams>();
  const [scatterPointSize, setScatterPointSize] = useState<number>(10);

  const updateHistogramGetter = useCallback(
    (g: () => HistogramParams) => setHistogramGetter(() => g),
    [setHistogramGetter]
  );

  const [selectionOptions, setSelectionOptions] = useState<SelectionOptions>();

  if (selectionType === SelectionType.unknown) {
    if (selectionOptions !== undefined && selectionOptions) {
      const entries = Object.entries(selectionOptions);
      const [k, v] = entries[0];
      if (k !== undefined && v !== undefined) {
        setSelectionType(toSelectionType(k));
        setSelectionMax(v);
      }
    }
  }

  const newSetSelectionType = useCallback(
    (t: SelectionType) => {
      setSelectionType(t);
      if (selectionOptions) {
        const m = selectionOptions[t];
        if (m !== undefined) {
          setSelectionMax(m);
        }
      }
    },
    [setSelectionType, setSelectionMax, selectionOptions]
  );

  const [plotType, setPlotType] = useState<PlotType>('Line');

  const {
    selections,
    updateSelection,
    setSelections,
    canSelect,
    enableSelect,
    setSelectionsListener,
    editable: canEditSelections,
    setEditable,
  } = useSelections([]);

  const [oldSelectionProps, setOldSelectionProps] =
    useState<PlotSelectionProps>();

  const updateSelectionContext = (selectionProps: PlotSelectionProps) => {
    const {
      selections: pSels,
      canEditSelections: pEdit,
      selectionsListener: pListener,
      selectionOptions: pOpts,
    } = selectionProps;
    let update = false;
    if (pSels !== undefined && oldSelectionProps?.selections !== pSels) {
      setSelections(pSels);
      update = true;
    }
    if (pEdit !== undefined && oldSelectionProps?.canEditSelections !== pEdit) {
      setEditable(pEdit);
      update = true;
    }
    if (
      pListener !== undefined &&
      oldSelectionProps?.selectionsListener !== pListener
    ) {
      setSelectionsListener(pListener);
      update = true;
    }
    if (pOpts !== undefined && oldSelectionProps?.selectionOptions !== pOpts) {
      setSelectionOptions(pOpts);
      setSelectionMax(0);
      update = true;
    }
    if (update) {
      setOldSelectionProps(selectionProps);
    }
  };

  const updateLineParams = useCallback(
    (key: string, lineParams: LineParams) => {
      const newLineParams = new Map(allLineParams);
      newLineParams.set(key, { ...lineParams });
      setAllLineParams(newLineParams);
    },
    [allLineParams]
  );

  interface XYDomains {
    xDomain?: Domain;
    yDomain?: Domain;
  }
  const [oldLineProps, setOldLineProps] = useState<XYDomains>();

  const updateLineContext = (
    xDomain?: Domain,
    yDomain?: Domain,
    plotConfig?: PlotConfig
  ) => {
    if (plotConfig !== undefined) {
      updatePCContext(plotConfig);
    }
    let update = false;
    if (xDomain !== undefined && oldLineProps?.xDomain !== xDomain) {
      setXDomain(xDomain);
      update = true;
    }
    if (yDomain !== undefined && oldLineProps?.yDomain !== yDomain) {
      setYDomain(yDomain);
      update = true;
    }
    if (update) {
      setOldLineProps({ xDomain, yDomain });
    }
    setPlotType('Line');
  };

  interface ImageProps {
    aspect?: Aspect;
  }
  const [oldImageProps, setOldImageProps] = useState<ImageProps>();

  const updateImageContext = (data: ImageData, plotConfig: PlotConfig) => {
    updatePCContext(plotConfig);
    const aspect = data.aspect;
    if (aspect !== undefined && oldImageProps?.aspect !== aspect) {
      setAspect(aspect);
      setOldImageProps({ aspect });
    }
    setPlotType('Image');
  };

  interface HeatmapProps {
    aspect?: Aspect;
    scale?: ScaleType;
    colourMap?: ColorMap;
    domain?: Domain;
  }
  const [oldHeatmapProps, setOldHeatmapProps] = useState<HeatmapProps>();

  const updateHeatmapContext = (data: HeatmapData, plotConfig: PlotConfig) => {
    updatePCContext(plotConfig);
    const { aspect, heatmapScale: scale, colourMap, domain } = data;
    let update = false;
    if (aspect !== undefined && oldHeatmapProps?.aspect !== data.aspect) {
      setAspect(aspect);
      update = true;
    }
    if (scale !== undefined && oldHeatmapProps?.scale !== scale) {
      setDScaleType(scale);
      update = true;
    }
    if (colourMap !== undefined && oldHeatmapProps?.colourMap !== colourMap) {
      setColourMap(colourMap);
      update = true;
    }
    if (domain !== undefined && oldHeatmapProps?.domain !== domain) {
      setDDomain(domain);
      update = true;
    }
    if (update) {
      setOldHeatmapProps({
        aspect,
        scale,
        colourMap,
        domain,
      });
    }
    setPlotType('Heatmap');
  };

  interface SurfaceProps {
    scale?: ScaleType;
    colourMap?: ColorMap;
    domain?: Domain;
    toggle?: boolean;
  }
  const [oldSurfaceProps, setOldSurfaceProps] = useState<SurfaceProps>();

  const updateSurfaceContext = (data: SurfaceData, plotConfig: PlotConfig) => {
    updatePCContext(plotConfig);
    const { surfaceScale: scale, colourMap, domain, showPoints: toggle } = data;
    let update = false;
    if (scale !== undefined && oldSurfaceProps?.scale !== scale) {
      setDScaleType(scale);
      update = true;
    }
    if (colourMap !== undefined && oldSurfaceProps?.colourMap !== colourMap) {
      setColourMap(colourMap);
      update = true;
    }
    if (domain !== undefined && oldSurfaceProps?.domain !== domain) {
      setDDomain(domain);
      update = true;
    }
    if (toggle !== undefined && oldSurfaceProps?.toggle !== toggle) {
      toggleShowPoints();
      update = true;
    }
    if (update) {
      setOldSurfaceProps({
        scale,
        colourMap,
        domain,
        toggle,
      });
    }
    setPlotType('Surface');
  };

  interface ScatterProps {
    colourMap?: ColorMap;
    domain?: Domain;
    pointSize?: number;
  }
  const [oldScatterProps, setOldScatterProps] = useState<ScatterProps>();

  const updateScatterContext = (data: ScatterData, plotConfig: PlotConfig) => {
    updatePCContext(plotConfig);
    const { colourMap, domain, pointSize } = data;
    let update = false;
    if (colourMap !== undefined && oldScatterProps?.colourMap !== colourMap) {
      setColourMap(colourMap);
      update = true;
    }
    if (domain !== undefined && oldScatterProps?.domain !== domain) {
      setDDomain(domain);
      update = true;
    }
    if (pointSize !== undefined && oldScatterProps?.pointSize !== pointSize) {
      setScatterPointSize(pointSize);
      update = true;
    }
    if (update) {
      setOldScatterProps({
        colourMap,
        domain,
        pointSize,
      });
    }
    setPlotType('Scatter');
  };

  const [oldPlotConfig, setOldPlotConfig] = useState<PlotConfig>();
  const updatePCContext = (plotConfig: PlotConfig) => {
    let update = false;
    if (
      plotConfig.title !== undefined &&
      oldPlotConfig?.title !== plotConfig.title
    ) {
      setTitle(plotConfig.title);
      update = true;
    }
    if (
      plotConfig.xLabel !== undefined &&
      oldPlotConfig?.xLabel !== plotConfig.xLabel
    ) {
      setXLabel(plotConfig.xLabel);
      update = true;
    }
    if (
      plotConfig.yLabel !== undefined &&
      oldPlotConfig?.yLabel !== plotConfig.yLabel
    ) {
      setYLabel(plotConfig.yLabel);
      update = true;
    }
    if (
      plotConfig.xScale !== undefined &&
      oldPlotConfig?.xScale !== plotConfig.xScale
    ) {
      setXScaleType(plotConfig.xScale);
      update = true;
    }
    if (
      plotConfig.yScale !== undefined &&
      oldPlotConfig?.yScale !== plotConfig.yScale
    ) {
      setYScaleType(plotConfig.yScale);
      update = true;
    }
    if (update) {
      setOldPlotConfig(plotConfig);
    }
  };

  useEffect(() => {
    enableSelect(plotType !== 'Surface');
  }, [enableSelect, plotType]);

  const contextValue = useMemo(
    () => {
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
        xScaleType,
        setXScaleType,
        yScaleType,
        setYScaleType,
        xDomain,
        setXDomain,
        xCustomDomain,
        setXCustomDomain,
        yDomain,
        setYDomain,
        yCustomDomain,
        setYCustomDomain,
        dDomain,
        setDDomain,
        dCustomDomain,
        setDCustomDomain,
        selectionOptions,
        selectionMax,
        selectionType,
        setSelectionType: newSetSelectionType,
        setSelectionsListener,
        histogramGetter,
        updateHistogramGetter,
        selections,
        setSelections,
        updateSelection,
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
        scatterPointSize,
        setScatterPointSize,
        showPoints,
        toggleShowPoints,
        canSelect,
        canEditSelections,
        plotType,
        updateLineContext,
        updateHeatmapContext,
        updateImageContext,
        updateScatterContext,
        updateSurfaceContext,
        updateSelectionContext,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      allLineParams,
      aspect,
      canSelect,
      canEditSelections,
      colourMap,
      currentLineKey,
      dCustomDomain,
      dDomain,
      dScaleType,
      histogramGetter,
      updateHistogramGetter,
      invertColourMap,
      mode,
      updateSelection,
      newSetSelectionType,
      plotType,
      selectionOptions,
      setSelectionsListener,
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
    ]
  );

  return (
    <PlotCustomizationContext.Provider value={contextValue}>
      {props.children}
    </PlotCustomizationContext.Provider>
  );
}
