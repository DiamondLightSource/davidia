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
} from '@h5web/lib';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

function HeatmapPlot(props: HeatmapPlotProps) {
  function getAspectType(): string {
    if (aspect === 'equal' || aspect === 'auto') {
      return aspect as string;
    } else {
      return 'number';
    }
  }
  const [aspect, setAspect] = useState<Aspect>(
    props.aspect ?? ('equal' as Aspect)
  );
  const [aspectType, setAspectType] = useState<string>(getAspectType());
  const [aspectRatio, setAspectRatio] = useState<number>(2);
  const [newAspectValue, setNewAspectValue] = useState<string>(
    String(aspectRatio)
  );
  const [error, setError] = useState(false);
  const [colorMap, setColorMap] = useState<ColorMap>(
    props.colorMap ?? ('Warm' as ColorMap)
  );
  const [invertColorMap, toggleColorMapInversion] = useToggle();
  const [showGrid, toggleGrid] = useToggle();
  const [title, setTitle] = useState(props.axesParameters.title);
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel);
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel);
  const [customDomain, setCustomDomain] = useState<Domain>(props.domain);
  const [xScaleType, setXScaleType] = useState<ScaleType>(
    props.axesParameters.xScale ?? ('linear' as ScaleType)
  );
  const [yScaleType, setYScaleType] = useState<ScaleType>(
    props.axesParameters.yScale ?? ('linear' as ScaleType)
  );
  const [heatmapScaleType, setHeatmapScaleType] = useState<ScaleType>(
    props.heatmapScale
  );

  function handleAspectTypeChange(val: string) {
    setError(false);
    setAspectType(val);
    if (aspectType === 'number') {
      setAspect(aspectRatio);
    } else {
      setAspect(val);
    }
  }

  function handleRatioChange(evt: React.ChangeEvent<HTMLInputElement>) {
    setError(false);
    const newValue = evt.currentTarget.value;
    setNewAspectValue(newValue);
  }

  function handleRatioSubmit() {
    setError(false);
    const isValid = !newAspectValue || validateNumberField(newAspectValue);
    if (isValid) {
      setAspectRatio(newAspectValue ? Number(newAspectValue) : 1);
      setAspect(aspectRatio);
    } else {
      setError(true);
    }
  }

  function validateNumberField(value: string) {
    const numbers = /^\d*\.?\d*$/;
    if (value.match(numbers)) {
      return Number(value) > 0 && Number(value) < 20;
    }
  }

  return (
    <>
      <Toolbar>
        {error && (
          <div
            style={{
              color: 'red',
              display: 'flex',
              alignItems: 'center',
              paddingRight: '10px',
            }}
          >
            {newAspectValue} is an invalid ratio
          </div>
        )}
        <label style={{ display: 'flex', alignItems: 'center' }}>
          aspect ratio:
        </label>
        <input
          type="text"
          pattern="[0-9]"
          name="digits"
          size={3}
          required
          onChange={handleRatioChange}
          value={newAspectValue}
          disabled={aspectType != 'number'}
        />
        <button
          value="Update aspect"
          onClick={handleRatioSubmit}
          disabled={aspectType != 'number'}
        >
          Update ratio
        </button>
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
          customDomain={customDomain as Domain}
          scaleType={heatmapScaleType}
          onCustomDomainChange={setCustomDomain}
        />
        <Separator />
        <ScaleSelector value={xScaleType} onScaleChange={setXScaleType} />
        <Separator />
        <ScaleSelector value={yScaleType} onScaleChange={setYScaleType} />
        <Separator />
        <ScaleSelector
          value={heatmapScaleType}
          onScaleChange={setHeatmapScaleType}
        />
        <Separator />
        <GridToggler value={showGrid} onToggle={toggleGrid} />
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
      <HeatmapVis
        dataArray={props.values}
        domain={customDomain}
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
      ></HeatmapVis>
    </>
  );
}

export default HeatmapPlot;
