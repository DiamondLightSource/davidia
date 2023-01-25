import '@h5web/lib/dist/styles.css';
import {
  CurveType,
  DataCurve,
  GlyphType,
  ResetZoomButton,
  SelectToZoom,
  TooltipMesh,
  VisCanvas,
} from '@h5web/lib';
import { ReactElement } from 'react';

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
  const tooltipText = (x: number, y: number): ReactElement<string> => {
    return (
      <p>
        {x.toPrecision(8)}, {y.toPrecision(8)}
      </p>
    );
  };
  return (
    <>
      <VisCanvas
        title={props.axesParameters.title}
        abscissaConfig={{
          visDomain: props.xDomain,
          showGrid: true,
          scaleType: props.axesParameters.xScale,
          label: props.axesParameters.xLabel,
          nice: true,
        }}
        ordinateConfig={{
          visDomain: props.yDomain,
          showGrid: true,
          scaleType: props.axesParameters.yScale,
          label: props.axesParameters.yLabel,
          nice: true,
        }}
      >
        {props.data.map((d, index) => createDataCurve(d, index))}
        <TooltipMesh renderTooltip={tooltipText} />
        <SelectToZoom />
        <ResetZoomButton />
      </VisCanvas>
    </>
  );
}

export default LinePlot;
