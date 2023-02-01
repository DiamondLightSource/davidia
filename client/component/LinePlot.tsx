import '@h5web/lib/dist/styles.css';
import {
  CurveType,
  DataCurve,
  DomainSlider,
  GlyphType,
  GridToggler,
  ResetZoomButton,
  ScaleSelector,
  SelectToZoom,
  Separator,
  Toolbar,
  TooltipMesh,
  VisCanvas,
} from '@h5web/lib';
import { ReactElement, useState } from 'react';
import { useToggle } from '@react-hookz/web';

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
  const [xDomain, setXDomain] = useState<Domain>(props.xDomain);
  const [yDomain, setYDomain] = useState<Domain>(props.yDomain);
  const [showGrid, toggleGrid] = useToggle(true);
  const [title, setTitle] = useState(props.axesParameters.title);
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel);
  console.log('props are', props);
  console.log('props.axesParameters.xLabel is', props.axesParameters.xLabel);
  console.log('xLabel is', xLabel);
  console.log('xDomain is', xDomain);
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel);
  const [xScaleType, setXScaleType] = useState<ScaleType>(
    props.axesParameters.xScale ?? ('linear' as ScaleType)
  );
  const [yScaleType, setYScaleType] = useState<ScaleType>(
    props.axesParameters.yScale ?? ('linear' as ScaleType)
  );

  const tooltipText = (x: number, y: number): ReactElement<string> => {
    return (
      <p>
        {x.toPrecision(8)}, {y.toPrecision(8)}
      </p>
    );
  };

  return (
    <>
      <Toolbar>
        <DomainSlider
          dataDomain={props.xDomain}
          customDomain={xDomain as Domain}
          scaleType={xScaleType}
          onCustomDomainChange={setXDomain}
        />
        <Separator />
        <DomainSlider
          dataDomain={props.yDomain}
          customDomain={yDomain as Domain}
          scaleType={yScaleType}
          onCustomDomainChange={setYDomain}
        />
        <Separator />
        <GridToggler value={showGrid} onToggle={toggleGrid} />
        <Separator />
        <ScaleSelector value={xScaleType} onScaleChange={setXScaleType} />
        <Separator />
        <ScaleSelector value={yScaleType} onScaleChange={setYScaleType} />
        <Separator />
        <label style={{ display: 'flex', alignItems: 'center' }}>title:</label>
        <input
          type="text"
          name="title"
          value={title}
          onChange={(evt) => {
            const { value: newValue } = evt.currentTarget;
            setTitle(newValue);
          }}
        />
        <Separator />
        <label style={{ display: 'flex', alignItems: 'center' }}>xLabel:</label>
        <input
          type="text"
          name="xLabel"
          value={xLabel}
          onChange={(evt) => {
            const { value: newValue } = evt.currentTarget;
            setXLabel(newValue);
          }}
        />
        <Separator />
        <label style={{ display: 'flex', alignItems: 'center' }}>yLabel:</label>
        <input
          type="text"
          name="yLabel"
          value={yLabel}
          onChange={(evt) => {
            const { value: newValue } = evt.currentTarget;
            setYLabel(newValue);
          }}
        />
        <Separator />
      </Toolbar>
      <VisCanvas
        title={title}
        abscissaConfig={{
          visDomain: xDomain,
          showGrid: showGrid,
          scaleType: xScaleType,
          label: xLabel,
          nice: true,
        }}
        ordinateConfig={{
          visDomain: yDomain,
          showGrid: showGrid,
          scaleType: yScaleType,
          label: yLabel,
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
