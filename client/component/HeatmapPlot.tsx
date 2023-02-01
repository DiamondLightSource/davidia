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
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';
import {
  getAspectType,
  isValidPositiveNumber,
  InputValidationState,
} from './utils';

function HeatmapPlot(props: HeatmapPlotProps) {
  const [aspect, setAspect] = useState<Aspect>(props.aspect ?? 'equal');
  const [aspectType, setAspectType] = useState<string>(getAspectType(aspect));
  const [aspectRatio, setAspectRatio] = useState<number>(2);
  const [newAspectValue, setNewAspectValue] = useState<string>(
    String(aspectRatio)
  );
  const [error, setError] = useState<InputValidationState>(
    InputValidationState.VALID
  );
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

  function handleAspectTypeChange(val: string) {
    setAspectType(val);
    if (val === 'number') {
      setAspect(aspectRatio);
    } else {
      setAspect(val as Aspect);
    }
  }

  function handleRatioChange(evt: React.ChangeEvent<HTMLInputElement>) {
    setError(InputValidationState.PENDING);
    setNewAspectValue(evt.currentTarget.value);
  }

  function handleRatioSubmit() {
    const [isValid, validValue] = isValidPositiveNumber(newAspectValue, 10);
    if (isValid) {
      setError(InputValidationState.VALID);
      setAspectRatio(validValue);
      setAspect(validValue);
      setNewAspectValue(validValue.toString());
    } else {
      setError(InputValidationState.ERROR);
    }
  }

  return (
    <>
      <Toolbar>
        {error === InputValidationState.ERROR && (
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
          name="digits"
          pattern="^\d+|\d+\.\d*$"
          size={3}
          required
          onChange={handleRatioChange}
          value={
            error === InputValidationState.PENDING
              ? newAspectValue
              : aspectRatio
          }
          disabled={aspectType !== 'number'}
        />
        <button
          value="Update aspect"
          onClick={handleRatioSubmit}
          disabled={aspectType !== 'number'}
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
          customDomain={customDomain}
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
      ></HeatmapVis>
    </>
  );
}

export default HeatmapPlot;
