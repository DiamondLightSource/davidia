import '@h5web/lib/dist/styles.css';
import {
  CurveType,
  DataCurve,
  DefaultInteractions,
  GlyphType,
  ModifierKey,
  ResetZoomButton,
  ScaleType,
  TooltipMesh,
  VisCanvas,
  getVisDomain,
} from '@h5web/lib';
import { ReactElement, useState } from 'react';
import { useToggle } from '@react-hookz/web';

import { SelectionComponent } from './SelectionComponent';
import { PlotToolbar } from './PlotToolbar';
import { createInteractionsConfig } from './utils';

function createDataCurve(d: DLineData, i: number): JSX.Element {
  const COLORLIST = [
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
  if (!d.color) {
    d.color = COLORLIST[i % COLORLIST.length];
  }

  return (
    <DataCurve
      key={`data_curve_${i}`}
      abscissas={d.x.data}
      ordinates={d.y.data}
      color={d.color}
      curveType={curveType}
      glyphType={GlyphType.Circle}
      glyphSize={d.point_size}
      visible={visible}
    />
  );
}

function LinePlot(props: LinePlotProps) {
  const [xCustomDomain, setXCustomDomain] = useState<CustomDomain>(
    props.xDomain
  );
  const [yCustomDomain, setYCustomDomain] = useState<CustomDomain>(
    props.yDomain
  );
  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState(props.axesParameters.title ?? '');
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel ?? 'y axis');
  console.log('props are', props);
  console.log('props.axesParameters.xLabel is', props.axesParameters.xLabel);
  console.log('xLabel is', xLabel);
  console.log('xDomain is', xCustomDomain);
  const [xScaleType, setXScaleType] = useState<ScaleType>(
    props.axesParameters.xScale ?? ScaleType.Linear
  );
  const [yScaleType, setYScaleType] = useState<ScaleType>(
    props.axesParameters.yScale ?? ScaleType.Linear
  );

  const tooltipText = (x: number, y: number): ReactElement<string> => {
    return (
      <p>
        {x.toPrecision(8)}, {y.toPrecision(8)}
      </p>
    );
  };
  const [mode, setMode] = useState<string>('panAndWheelZoom');
  const interactionsConfig = createInteractionsConfig(
    mode as InteractionModeType
  );

  return (
    <>
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
        yScaleType={yScaleType}
        setYScaleType={setYScaleType}
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
          disabled={mode !== 'selectRegion'}
          addSelection={props.addSelection}
          selections={props.selections}
        />
      </VisCanvas>
    </>
  );
}

export default LinePlot;
