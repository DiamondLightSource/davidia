import {
  CurveType,
  DataCurve,
  DefaultInteractions,
  type Domain,
  GlyphType,
  type ModifierKey,
  ResetZoomButton,
  TooltipMesh,
  VisCanvas,
  getVisDomain,
} from '@h5web/lib';
import { useEffect, useMemo, type ReactElement } from 'react';

import SelectionComponent from './SelectionComponent';
import type { PlotBaseProps, NDT } from './models';
import { createInteractionsConfig, InteractionModeType } from './utils';
import {
  PlotCustomizationContextProvider,
  usePlotCustomizationContext,
} from './PlotCustomizationContext';
import { AnyToolbar } from './PlotToolbar';

/**
 * Represent line data
 */
interface LineData {
  /** The object key */
  key: string;
  /** Line parameters */
  lineParams: LineParams;
  /** x coordinates */
  x: NDT;
  /** x data domain */
  xDomain: Domain;
  /** y coordinates */
  y: NDT;
  /** y data domain */
  yDomain: Domain;
  /** Line uses default generated x-axis values */
  defaultIndices?: boolean;
}

/**
 * Represent line parameters
 */
interface LineParams {
  /** The line name */
  name: string;
  /** The line colour */
  colour?: string;
  /** If line is visible */
  lineOn: boolean;
  /** The size of the data points (optional) */
  pointSize?: number;
  /** The type of glyph */
  glyphType: GlyphType;
}

/**
 * Props for the `LinePlot` component.
 */
interface LinePlotProps extends PlotBaseProps {
  /** The line data */
  lineData: LineData[];
  /** The x data domain */
  xDomain?: Domain;
  /** The y data domain */
  yDomain?: Domain;
  /** Handles updating line params */
  updateLineParams?: (key: string, params: LineParams) => void;
}

type LinePlotCustomizationProps = Omit<LinePlotProps, 'lineData'>;

/**
 * Create and render a data curve.
 * @param {LineData} d - Line data.
 * @param {LineParams} p - Line params.
 * @param {number} i - Number of data curve.
 * @returns {JSX.Element} The rendered component.
 */
function createDataCurve(
  d: LineData,
  p: LineParams,
  i: number
): React.JSX.Element {
  const COLOURLIST = [
    'rgb(0, 0, 0)', //       #000000, black
    'rgb(0, 158, 115)', //   #009e73, teal
    'rgb(230, 157, 0)', //   #e69d00, orange
    'rgb(86, 179, 233)', //  #56b3e9, light blue
    'rgb(240, 228, 66)', //  #f0e442, yellow
    'rgb(0, 114, 178)', //   #0072b2, blue
    'rgb(213, 94, 0)', //    #d55e00, dark orange
    'rgb(204, 121, 167)', // #cc79a7, pink
  ];
  let visible = true;
  let curveType = CurveType.LineAndGlyphs;
  if (!p.pointSize) {
    p.pointSize = 0;
    if (p.lineOn) {
      curveType = CurveType.LineOnly;
    } else {
      visible = false;
    }
  } else if (!p.lineOn) {
    curveType = CurveType.GlyphsOnly;
  }
  const colour = p.colour ?? COLOURLIST[i % COLOURLIST.length];

  return (
    <DataCurve
      key={`data_curve_${i}`}
      abscissas={d.x.data}
      ordinates={d.y.data}
      color={colour}
      curveType={curveType}
      glyphType={p.glyphType ?? GlyphType.Circle}
      glyphSize={p.pointSize}
      visible={visible}
    />
  );
}

interface Props {
  lineData: LineData[];
}
export function LineVisCanvas(props: Props) {
  const {
    title,
    showGrid,
    xCustomDomain,
    xDomain,
    xScaleType,
    xLabel,
    yCustomDomain,
    yDomain,
    yScaleType,
    yLabel,
    mode,
    setAllLineParams,
    currentLineKey,
    setCurrentLineKey,
    batonProps,
    canSelect,
    selectionType,
    updateSelection,
    selections,
  } = usePlotCustomizationContext();
  const lineData = props.lineData;

  const initLineParams = useMemo(() => {
    const all = new Map<string, LineParams>();
    lineData.forEach((d) => {
      all.set(d.key, d.lineParams);
    });
    return all;
  }, [lineData]);

  useEffect(() => {
    if (currentLineKey == null && initLineParams.size) {
      const key = initLineParams.keys().next().value as string;
      setCurrentLineKey(key);
    }
    setAllLineParams(initLineParams);
  }, [currentLineKey, initLineParams, setAllLineParams, setCurrentLineKey]);

  const interactionsConfig = createInteractionsConfig(mode);
  const tooltipText = (x: number, y: number): ReactElement<string> => {
    return (
      <p>
        {x.toPrecision(8)}, {y.toPrecision(8)}
      </p>
    );
  };

  const xVisDomain = useMemo(() => {
    return getVisDomain(xCustomDomain, xDomain);
  }, [xCustomDomain, xDomain]);

  const yVisDomain = useMemo(() => {
    return getVisDomain(yCustomDomain, yDomain);
  }, [yCustomDomain, yDomain]);

  return (
    <VisCanvas
      title={title ?? ''}
      abscissaConfig={{
        visDomain: xVisDomain,
        showGrid: showGrid,
        scaleType: xScaleType,
        label: xLabel,
        nice: true,
      }}
      ordinateConfig={{
        visDomain: yVisDomain,
        showGrid: showGrid,
        scaleType: yScaleType,
        label: yLabel,
        nice: true,
      }}
    >
      <DefaultInteractions {...interactionsConfig} />
      {lineData.map((d, index) => {
        const lp = initLineParams?.get(d.key) ?? d.lineParams;
        return createDataCurve(d, lp, index);
      })}
      <TooltipMesh renderTooltip={tooltipText} />
      <ResetZoomButton />
      {canSelect && (
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          batonProps={batonProps}
          disabled={mode !== InteractionModeType.selectRegion}
          selectionType={selectionType}
          updateSelection={updateSelection}
          selections={selections}
        />
      )}
    </VisCanvas>
  );
}

/**
 * Render a line plot.
 * @param {LinePlotProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function LinePlot(props: LinePlotProps) {
  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <PlotCustomizationContextProvider {...props}>
        <AnyToolbar>{props.customToolbarChildren}</AnyToolbar>
        <LineVisCanvas lineData={props.lineData} />
      </PlotCustomizationContextProvider>
    </div>
  );
}

export default LinePlot;
export type { LineData, LineParams, LinePlotProps, LinePlotCustomizationProps };
