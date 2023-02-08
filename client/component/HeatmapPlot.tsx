import '@h5web/lib/dist/styles.css';
import {
  AxisParams,
  ColorMapSelector,
  DomainSlider,
  GridToggler,
  HeatmapVis,
  ScaleSelector,
  Separator,
  ToggleGroup,
  Toolbar,
  getVisDomain,
} from '@h5web/lib';
import { useEffect, useState } from 'react';
import { useToggle } from '@react-hookz/web';

import { LabelledInput } from './LabelledInput';
import { getAspectType, isValidPositiveNumber } from './utils';
import { SelectionComponent } from './SelectionComponent';

function HeatmapPlot(props: HeatmapPlotProps) {
  const [aspect, setAspect] = useState<Aspect>(props.aspect ?? 'equal');
  const [aspectType, setAspectType] = useState<string>(getAspectType(aspect));
  const [aspectRatio, setAspectRatio] = useState<number>(2);
  const [colorMap, setColorMap] = useState<ColorMap>(
    props.colorMap ?? ('Warm' as ColorMap)
  );
  const [invertColorMap, toggleColorMapInversion] = useToggle();
  const [showGrid, toggleGrid] = useToggle();
  const [title, setTitle] = useState(props.axesParameters.title);
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel);
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel);
  const [customDomain, setCustomDomain] = useState<CustomDomain>([
    ...props.domain,
  ]);
  const [xScaleType, setXScaleType] = useState<ScaleType>(
    props.axesParameters.xScale ?? ('linear' as ScaleType)
  );
  const [yScaleType, setYScaleType] = useState<ScaleType>(
    props.axesParameters.yScale ?? ('linear' as ScaleType)
  );
  const [heatmapScaleType, setHeatmapScaleType] = useState<ScaleType>(
    props.heatmapScale
  );
  const [persistedSelection, setPersistedSelection] = useState<
    Rect | undefined
  >();
  function handleAspectTypeChange(val: string) {
    setAspectType(val);
    if (val === 'number') {
      setAspect(aspectRatio);
    } else {
      setAspect(val as Aspect);
    }
  }
  useEffect(() => {
    props.updateSelection(persistedSelection);
  }, [props, persistedSelection]);

  return (
    <>
      <Toolbar>
        <LabelledInput<number>
          key="0"
          disabled={aspectType !== 'number'}
          label="aspect ratio"
          input={aspectRatio}
          isValid={(v) => isValidPositiveNumber(v, 10)}
          inputAttribs={{
            name: 'digits',
            pattern: '^\\d+|\\d+.\\d*$',
            size: 3,
          }}
          updateValue={(v) => {
            setAspect(v);
            setAspectRatio(v);
          }}
          submitLabel="update ratio"
        />
        <ToggleGroup
          role="radiogroup"
          ariaLabel="aspect"
          value={aspectType}
          onChange={handleAspectTypeChange}
        >
          <ToggleGroup.Btn label="number" value="number" />
          <ToggleGroup.Btn label="auto" value="auto" />
          <ToggleGroup.Btn label="equal" value="equal" />
        </ToggleGroup>
        <Separator />
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
          scaleType={heatmapScaleType}
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
        <ScaleSelector
          label="value"
          value={heatmapScaleType}
          onScaleChange={setHeatmapScaleType}
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
      <HeatmapVis
        dataArray={props.values}
        domain={getVisDomain(customDomain, props.domain)}
        colorMap={colorMap}
        invertColorMap={invertColorMap}
        scaleType={heatmapScaleType}
        aspect={aspect}
        showGrid={showGrid}
        title={title}
        abscissaParams={
          {
            label: xLabel,
            scaleType: xScaleType,
            value: props.axesParameters.xValues?.data,
          } as AxisParams
        }
        ordinateParams={
          {
            label: yLabel,
            scaleType: yScaleType,
            value: props.axesParameters.yValues?.data,
          } as AxisParams
        }
      >
        <SelectionComponent
          updateValue={setPersistedSelection}
          input={persistedSelection}
        />
      </HeatmapVis>
    </>
  );
}

export default HeatmapPlot;
