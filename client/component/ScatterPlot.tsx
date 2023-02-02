import '@h5web/lib/dist/styles.css';
import {
  ColorMapSelector,
  DomainSlider,
  GridToggler,
  ScaleSelector,
  ScatterVis,
  Separator,
  Toolbar,
  getVisDomain,
} from '@h5web/lib';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

import { LabelledInput } from './LabelledInput';

function ScatterPlot(props: ScatterPlotProps) {
  const abscissaValue: TypedArray =
    props.axesParameters.xValues?.data ?? props.xData.data;
  const ordinateValue: TypedArray =
    props.axesParameters.yValues?.data ?? props.yData.data;
  const [colorMap, setColorMap] = useState(
    props.colorMap === undefined ? 'Viridis' : props.colorMap
  );
  const [title, setTitle] = useState(props.axesParameters.title);
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel);
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel);
  const [invertColorMap, toggleColorMapInversion] = useToggle();
  const [showGrid, toggleGrid] = useToggle();
  const [customDomain, setCustomDomain] = useState<CustomDomain>([
    ...props.domain,
  ]);
  const [xScaleType, setXScaleType] = useState<ScaleType>(
    props.axesParameters.xScale ?? ('linear' as ScaleType)
  );
  const [yScaleType, setYScaleType] = useState(
    props.axesParameters.yScale ?? ('linear' as ScaleType)
  );

  return (
    <>
      <Toolbar>
        <ColorMapSelector
          value={colorMap}
          onValueChange={setColorMap}
          invert={invertColorMap}
          onInversionChange={toggleColorMapInversion}
        />
        <Separator />
        <DomainSlider
          dataDomain={props.domain}
          customDomain={customDomain}
          scaleType={'linear' as ScaleType}
          onCustomDomainChange={setCustomDomain}
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
      <ScatterVis
        abscissaParams={{
          label: xLabel,
          value: abscissaValue,
          scaleType: xScaleType,
        }}
        colorMap={colorMap}
        title={title}
        invertColorMap={invertColorMap}
        dataArray={props.dataArray}
        domain={getVisDomain(customDomain, props.domain)}
        ordinateParams={{
          label: yLabel,
          value: ordinateValue,
          scaleType: yScaleType,
        }}
        showGrid={showGrid}
      />
    </>
  );
}

export default ScatterPlot;
