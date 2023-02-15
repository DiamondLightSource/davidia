import '@h5web/lib/dist/styles.css';
import {
  CurveType,
  DataCurve,
  DefaultInteractions,
  DomainSlider,
  GlyphType,
  GridToggler,
  ModifierKey,
  ResetZoomButton,
  ScaleSelector,
  Separator,
  Toolbar,
  TooltipMesh,
  VisCanvas,
  getVisDomain,
} from '@h5web/lib';
import { ReactElement, useState } from 'react';
import { useToggle } from '@react-hookz/web';

import { InteractionModeToggle } from './InteractionModeToggle';
import { LabelledInput } from './LabelledInput';
import { SelectionComponent } from './SelectionComponent';
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
  const [xDomain, setXDomain] = useState<CustomDomain>(props.xDomain);
  const [yDomain, setYDomain] = useState<CustomDomain>(props.yDomain);
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
  const [mode, setMode] = useState<string>('panAndWheelZoom');
  const interactionsConfig = createInteractionsConfig(
    mode as InteractionModeType
  );

  return (
    <>
      <Toolbar>
        <InteractionModeToggle
          value={mode}
          onModeChange={setMode}
        ></InteractionModeToggle>
        <DomainSlider
          dataDomain={props.xDomain}
          customDomain={xDomain}
          scaleType={xScaleType}
          onCustomDomainChange={setXDomain}
        />
        <Separator />
        <DomainSlider
          dataDomain={props.yDomain}
          customDomain={yDomain}
          scaleType={yScaleType}
          onCustomDomainChange={setYDomain}
        />
        <Separator />
        <ScaleSelector
          label="x"
          value={xScaleType}
          onScaleChange={setXScaleType}
        />
        <Separator />
        <ScaleSelector
          label="y"
          value={yScaleType}
          onScaleChange={setYScaleType}
        />
        <Separator />
        <GridToggler value={showGrid} onToggle={toggleGrid} />
        <Separator />
        <LabelledInput<string>
          key="1"
          label="title"
          input={title ?? ''}
          updateValue={setTitle}
        />
        <Separator />
        <LabelledInput<string>
          key="2"
          label="x-axis"
          input={xLabel ?? ''}
          updateValue={setXLabel}
        />
        <Separator />
        <LabelledInput<string>
          key="3"
          label="y-axis"
          input={yLabel ?? ''}
          updateValue={setYLabel}
        />
        <Separator />
      </Toolbar>
      <VisCanvas
        title={title}
        abscissaConfig={{
          visDomain: getVisDomain(xDomain, props.xDomain),
          showGrid: showGrid,
          scaleType: xScaleType,
          label: xLabel,
          nice: true,
        }}
        ordinateConfig={{
          visDomain: getVisDomain(yDomain, props.yDomain),
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
