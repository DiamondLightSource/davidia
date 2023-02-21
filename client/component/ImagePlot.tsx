import '@h5web/lib/dist/styles.css';
import {
  AxisParams,
  GridToggler,
  ModifierKey,
  RgbVis,
  Separator,
  Toolbar,
} from '@h5web/lib';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

import { AspectConfigModal } from './AspectConfigModal';
import { AxisConfigModal } from './AxisConfigModal';
import { InteractionModeToggle } from './InteractionModeToggle';
import { LabelledInput } from './LabelledInput';
import { SelectionComponent } from './SelectionComponent';
import { createInteractionsConfig, getAspectType } from './utils';

function ImagePlot(props: ImagePlotProps) {
  const [aspect, setAspect] = useState<Aspect>(props.aspect ?? 'equal');
  const [aspectType, setAspectType] = useState<string>(getAspectType(aspect));
  const [aspectRatio, setAspectRatio] = useState<number>(2);
  const [title, setTitle] = useState(props.axesParameters.title);
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel);
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel);
  const [showGrid, toggleGrid] = useToggle(true);
  const [mode, setMode] = useState<string>('panAndWheelZoom');
  const interactionsConfig = createInteractionsConfig(
    mode as InteractionModeType
  );
  const [showXModal, setShowXModal] = useState(false);
  const [showYModal, setShowYModal] = useState(false);
  const [showAspectModal, setShowAspectModal] = useState(false);

  return (
    <>
      <Toolbar>
        <InteractionModeToggle
          value={mode}
          onModeChange={setMode}
        ></InteractionModeToggle>
        <Separator />
        <button onClick={() => setShowXModal(true)}> X axis</button>
        <button onClick={() => setShowYModal(true)}> Y axis</button>
        <button onClick={() => setShowAspectModal(true)}> Aspect</button>
        <AxisConfigModal
          title={'x axis'}
          label={xLabel}
          setLabel={setXLabel}
          onClose={() => setShowXModal(false)}
          show={showXModal}
        ></AxisConfigModal>
        <AxisConfigModal
          title={'y axis'}
          label={yLabel}
          setLabel={setYLabel}
          onClose={() => setShowYModal(false)}
          show={showYModal}
        ></AxisConfigModal>
        <AspectConfigModal
          title={'Aspect'}
          onClose={() => setShowAspectModal(false)}
          show={showAspectModal}
          aspect={aspect}
          setAspect={setAspect}
          aspectType={aspectType}
          setAspectType={setAspectType}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
        ></AspectConfigModal>
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
        interactions={interactionsConfig}
      >
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          disabled={mode !== 'selectRegion'}
          addSelection={props.addSelection}
          selections={props.selections}
        />
      </RgbVis>
    </>
  );
}

export default ImagePlot;
