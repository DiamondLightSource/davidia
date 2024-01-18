import {
  type AxisScaleType,
  CurveType,
  type CustomDomain,
  DataCurve,
  DefaultInteractions,
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
import type { DLineData, LinePlotProps, MP_NDArray } from './AnyPlot';

/**
 * Represents line data.
 * @interface {object} LineData
 * @member {string} key - The key.
 * @member {string} [colour] - The line colour.
 * @member {MP_NDArray} x - The x data.
 * @member {MP_NDArray} y - The y data.
 * @member {boolean} line_on - If line is visible.
 * @member {number} [point_size] - The data point size.
 */
interface LineData {
  /** The key */
  key: string;
  /** The line colour (optional) */
  colour?: string;
  /** The x data */
  x: MP_NDArray;
  /** The y data */
  y: MP_NDArray;
  /** If line is visible */
  line_on: boolean;
  /** The data point size (optional) */
  point_size?: number;
}

/**
 *
 * Creates and renders a data curve.
 * @param {DLineData} d - Line data.
 * @param {number} i - number of data curve.
 * @returns {JSX.Element} The rendered component.
 */
function createDataCurve(d: DLineData, i: number): JSX.Element {
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
  if (!d.point_size) {
    d.point_size = 0;
    if (d.line_on) {
      curveType = CurveType.LineOnly;
    } else {
      visible = false;
    }
  } else if (!d.line_on) {
    curveType = CurveType.GlyphsOnly;
  }
  const colour = d.colour ?? COLOURLIST[i % COLOURLIST.length];

  return (
    <DataCurve
      key={`data_curve_${i}`}
      abscissas={d.x.data}
      ordinates={d.y.data}
      color={colour}
      curveType={curveType}
      glyphType={GlyphType.Circle}
      glyphSize={d.point_size}
      visible={visible}
    />
  );
}

/**
 *
 * Renders a line plot.
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
  const [title, setTitle] = useState(props.axesParameters.title ?? '');
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel ?? 'y axis');
  const [xScaleType, setXScaleType] = useState<AxisScaleType>(
    props.axesParameters.xScale ?? ScaleType.Linear
  );
  const [yScaleType, setYScaleType] = useState<AxisScaleType>(
    props.axesParameters.yScale ?? ScaleType.Linear
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
        {props.data.map((d, index) => createDataCurve(d, index))}
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
export type { LineData };
