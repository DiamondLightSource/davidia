import {
  type AxisScaleType,
  CurveType,
  type CustomDomain,
  DataCurve,
  DefaultInteractions,
  type Domain,
  GlyphType,
  type ModifierKey,
  ResetZoomButton,
  ScaleType,
  TooltipMesh,
  VisCanvas,
  getVisDomain,
} from '@h5web/lib';
import { type ReactElement, useState } from 'react';
import { useToggle } from '@react-hookz/web';

import PlotToolbar from './PlotToolbar';
import SelectionComponent from './SelectionComponent';
import { SelectionType } from './selections/utils';
import { createInteractionsConfig, InteractionModeType } from './utils';
import type { NDT, PlotBaseProps } from './AnyPlot';

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
function createDataCurve(d: LineData, i: number): JSX.Element {
  const COLOURLIST = [
    'rgb(0, 0, 0)',
    'rgb(230, 159, 0)',
    'rgb(86, 180, 233)',
    'rgb(0, 158, 115)',
    'rgb(240, 228, 66)',
    'rgb(0, 114, 178)',
    'rgb(213, 94, 0)',
    'rgb(204, 121, 167)',
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

/**
 * Render a line plot.
 * @param {LinePlotProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function LinePlot(props: LinePlotProps) {
  const [xCustomDomain, setXCustomDomain] = useState<CustomDomain>([
    null,
    null,
  ]);
  const [yCustomDomain, setYCustomDomain] = useState<CustomDomain>([
    null,
    null,
  ]);
  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState(props.plotConfig.title ?? '');
  const [xLabel, setXLabel] = useState(props.plotConfig.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.plotConfig.yLabel ?? 'y axis');
  const [xScaleType, setXScaleType] = useState<AxisScaleType>(
    props.plotConfig.xScale ?? ScaleType.Linear
  );
  const [yScaleType, setYScaleType] = useState<AxisScaleType>(
    props.plotConfig.yScale ?? ScaleType.Linear
  );

  const tooltipText = (x: number, y: number): ReactElement<string> => {
    return (
      <p>
        {x.toPrecision(8)}, {y.toPrecision(8)}
      </p>
    );
  };
  const [mode, setMode] = useState<InteractionModeType>(
    InteractionModeType.panAndWheelZoom
  );
  const interactionsConfig = createInteractionsConfig(mode);
  const [selectionType, setSelectionType] = useState<SelectionType>(
    SelectionType.line
  );

  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <PlotToolbar
        showGrid={showGrid}
        toggleShowGrid={toggleShowGrid}
        title={title}
        setTitle={setTitle}
        mode={mode}
        setMode={setMode}
        xDomain={props.xDomain}
        xCustomDomain={xCustomDomain}
        setXCustomDomain={setXCustomDomain}
        xLabel={xLabel}
        setXLabel={setXLabel}
        xScaleType={xScaleType}
        setXScaleType={setXScaleType}
        yDomain={props.yDomain}
        yCustomDomain={yCustomDomain}
        setYCustomDomain={setYCustomDomain}
        yLabel={yLabel}
        setYLabel={setYLabel}
        batonProps={props.batonProps}
        yScaleType={yScaleType}
        setYScaleType={setYScaleType}
        selectionType={selectionType}
        setSelectionType={setSelectionType}
        selections={props.selections}
        updateSelections={props.addSelection}
        lineData={props.lineData}
        updateLineParams={props.updateLineParams}
      />
      <VisCanvas
        title={title}
        abscissaConfig={{
          visDomain: getVisDomain(xCustomDomain, props.xDomain),
          showGrid: showGrid,
          scaleType: xScaleType,
          label: xLabel,
          nice: true,
        }}
        ordinateConfig={{
          visDomain: getVisDomain(yCustomDomain, props.yDomain),
          showGrid: showGrid,
          scaleType: yScaleType,
          label: yLabel,
          nice: true,
        }}
      >
        <DefaultInteractions {...interactionsConfig} />
        {props.lineData.map((d, index) => createDataCurve(d, index))}
        <TooltipMesh renderTooltip={tooltipText} />
        <ResetZoomButton />
        {props.addSelection && (
          <SelectionComponent
            modifierKey={[] as ModifierKey[]}
            batonProps={props.batonProps}
            disabled={mode !== InteractionModeType.selectRegion}
            selectionType={selectionType}
            addSelection={props.addSelection}
            selections={props.selections}
          />
        )}
      </VisCanvas>
    </div>
  );
}

export default LinePlot;
export type { LineData, LineParams, LinePlotProps };
