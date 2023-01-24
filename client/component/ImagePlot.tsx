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
  const [title, setTitle] = useState(props.axesParameters.title);
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel);
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel);
  const [showGrid, toggleGrid] = useToggle(true);

  function handleAspectTypeChange(val: string) {
    console.log('val is', val);
    setAspectType(val);
    if (aspectType === 'number') {
      console.log('setting aspect', aspect);
      console.log('aspect type is', aspectType);
      console.log('setting aspect ratio', aspectRatio);
      setAspect(aspectRatio);
    } else {
      console.log('setting aspect', aspect);
      console.log('aspect type is', aspectType);
      setAspect(val);
    }
  }

  function handleRatioChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const { value: newValue } = evt.currentTarget;
    console.log('updating ratio to', newValue);
    const isValid = !newValue || validateNumberField(newValue);
    if (isValid) {
      setAspectRatio(newValue ? Number(newValue) : 1);
      setAspect(aspectRatio);
    }
  }

  function validateNumberField(value: string) {
    const numbers = /^[0-9]+$/;
    if (value.match(numbers)) {
      return Number(value) > 0 && Number(value) < 10;
    }
  }

  return (
    <>
      <Toolbar>
        <Separator />
        <label>
          aspect ratio:
          <input
            type="text"
            pattern="[0-9]"
            name="digits"
            required
            onChange={handleRatioChange}
            value={String(aspectRatio)}
            disabled={aspectType != 'number'}
          />
        </label>
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
        <label>
          title:
          <input
            type="text"
            name="title"
            value={title}
            onChange={(evt) => {
              const { value: newValue } = evt.currentTarget;
              setTitle(newValue);
            }}
          />
        </label>
        <Separator />
        <label>
          xLabel:
          <input
            type="text"
            name="xLabel"
            value={xLabel}
            onChange={(evt) => {
              const { value: newValue } = evt.currentTarget;
              setXLabel(newValue);
            }}
          />
        </label>
        <Separator />
        <label>
          yLabel:
          <input
            type="text"
            name="yLabel"
            value={yLabel}
            onChange={(evt) => {
              const { value: newValue } = evt.currentTarget;
              setYLabel(newValue);
            }}
          />
        </label>
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
