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
import {
  getAspectType,
  isValidPositiveNumber,
  InputValidationState,
} from './utils';

function ImagePlot(props: ImagePlotProps) {
  const [aspect, setAspect] = useState<Aspect>(props.aspect ?? 'equal');
  const [aspectType, setAspectType] = useState<string>(getAspectType(aspect));
  const [aspectRatio, setAspectRatio] = useState<number>(2);
  const [newAspectValue, setNewAspectValue] = useState<string>(
    String(aspectRatio)
  );
  const [error, setError] = useState<InputValidationState>(
    InputValidationState.VALID
  );
  const [title, setTitle] = useState(props.axesParameters.title);
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel);
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel);
  const [showGrid, toggleGrid] = useToggle(true);

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

  const alignStyle = { display: 'flex', alignItems: 'center' };

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
        <label style={alignStyle}>aspect ratio:</label>
        <input
          type="text"
          name="digits"
          size={3}
          required
          onChange={handleRatioChange}
          value={
            error === InputValidationState.PENDING
              ? newAspectValue
              : aspectRatio
          }
          disabled={aspectType != 'number'}
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
        <GridToggler value={showGrid} onToggle={toggleGrid} />
        <Separator />
        <label style={alignStyle}>title:</label>
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
        <label style={alignStyle}>xLabel:</label>
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
