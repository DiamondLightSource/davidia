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

interface LineData {
  key: string;
  colour?: string;
  x: MP_NDArray;
  y: MP_NDArray;
  line_on: boolean;
  point_size?: number;
}

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
  const [mode, setMode] = useState<string>(InteractionModeType.panAndWheelZoom);
  const interactionsConfig = createInteractionsConfig(
    mode as InteractionModeType
  );
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
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          batonProps={props.batonProps}
          disabled={mode !== 'selectRegion'}
          selectionType={selectionType}
          addSelection={props.addSelection}
          selections={props.selections}
        />
      </VisCanvas>
    </div>
  );
}

export default LinePlot;
export type { LineData };
