import '@h5web/lib/dist/styles.css';
import {
  AxisParams,
  GridToggler,
  RgbVis,
  Separator,
  ToggleGroup,
  Toolbar,
} from '@h5web/lib';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

function ImagePlot(props: ImagePlotProps) {
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
  const [title, setTitle] = useState(props.axesParameters.title);
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel);
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel);
  const [showGrid, toggleGrid] = useToggle(true);

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
      <RgbVis
        dataArray={props.values}
        aspect={aspect}
        showGrid={showGrid}
        title={title}
        abscissaParams={
          {
            label: xLabel,
            value: props.axesParameters.xValues?.data,
          } as AxisParams
        }
        ordinateParams={
          {
            label: yLabel,
            value: props.axesParameters.yValues?.data,
          } as AxisParams
        }
      ></RgbVis>
    </>
  );
}

export default ImagePlot;
