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

import { LabelledInput } from './LabelledInput';
import { getAspectType, isValidPositiveNumber } from './utils';

function ImagePlot(props: ImagePlotProps) {
  const [aspect, setAspect] = useState<Aspect>(props.aspect ?? 'equal');
  const [aspectType, setAspectType] = useState<string>(getAspectType(aspect));
  const [aspectRatio, setAspectRatio] = useState<number>(2);
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
