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
import React, { type ReactElement } from 'react';

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
  xDomain: Domain;
  /** The y data domain */
  yDomain: Domain;
  /** Handles updating line data */
  updateLineParams: (d: LineData) => void;
}

/**
 * Create and render a data curve.
 * @param {LineData} d - Line data.
 * @param {number} i - Number of data curve.
 * @returns {React.JSX.Element} The rendered component.
 */
function createDataCurve(d: LineData, i: number): React.JSX.Element {
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
  const lineParams = d.lineParams;
  if (!lineParams.pointSize) {
    lineParams.pointSize = 0;
    if (lineParams.lineOn) {
      curveType = CurveType.LineOnly;
    } else {
      visible = false;
    }
  } else if (!lineParams.lineOn) {
    curveType = CurveType.GlyphsOnly;
  }
  const colour = lineParams.colour ?? COLOURLIST[i % COLOURLIST.length];

  return (
    <DataCurve
      key={`data_curve_${i}`}
      abscissas={d.x.data}
      ordinates={d.y.data}
      color={colour}
      curveType={curveType}
      glyphType={lineParams.glyphType ?? GlyphType.Circle}
      glyphSize={lineParams.pointSize}
      visible={visible}
    />
  );
}

export function LineVisCanvas() {
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
    lineData,
    batonProps,
    selectionType,
    updateSelection,
    selections,
  } = usePlotCustomizationContext();
  const interactionsConfig = createInteractionsConfig(mode);
  const tooltipText = (x: number, y: number): ReactElement<string> => {
    return (
      <p>
        {x.toPrecision(8)}, {y.toPrecision(8)}
      </p>
    );
  };

  return (
    <VisCanvas
      title={title ?? ''}
      abscissaConfig={{
        visDomain: getVisDomain(xCustomDomain, xDomain),
        showGrid: showGrid,
        scaleType: xScaleType,
        label: xLabel,
        nice: true,
      }}
      ordinateConfig={{
        visDomain: getVisDomain(yCustomDomain, yDomain),
        showGrid: showGrid,
        scaleType: yScaleType,
        label: yLabel,
        nice: true,
      }}
    >
      <DefaultInteractions {...interactionsConfig} />
      {lineData.map((d, index) => createDataCurve(d, index))}
      <TooltipMesh renderTooltip={tooltipText} />
      <ResetZoomButton />
      {updateSelection && (
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          batonProps={batonProps}
          disabled={mode !== InteractionModeType.selectRegion}
          selectionType={selectionType}
          addSelection={updateSelection}
          selections={selections}
        />
      )}
    </VisCanvas>
  );
}

/**
 * Render a line plot.
 * @param {LinePlotProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
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
        <LineVisCanvas />
      </PlotCustomizationContextProvider>
    </div>
  );
}

export default LinePlot;
export type { LineData, LineParams, LinePlotProps };
