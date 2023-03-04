import '@h5web/lib/dist/styles.css';
import {
  AxisParams,
  GridToggler,
  HeatmapVis,
  Separator,
  Toolbar,
  getVisDomain,
  ModifierKey,
  ColorMapOption,
  ToggleBtn,
} from '@h5web/lib';
import { MouseEvent, useState } from 'react';
import { BsCardHeading } from 'react-icons/bs';
import { MdAspectRatio } from 'react-icons/md';
import { TbAxisX, TbAxisY } from 'react-icons/tb';
import { useToggle } from '@react-hookz/web';

import { AspectConfigModal } from './AspectConfigModal';
import { AxisConfigModal } from './AxisConfigModal';
import { InteractionModeToggle } from './InteractionModeToggle';
import { LabelledInput } from './LabelledInput';
import { SelectionComponent } from './SelectionComponent';
import { createInteractionsConfig, getAspectType } from './utils';
import styles from './ToggleGroup.module.css';
import { Modal } from './Modal';

interface TitleConfigModalProps {
  title: string;
  show: boolean;
  onClose: (e: MouseEvent) => void;
  label?: string;
  setLabel: (value: string) => void;
}

function TitleConfigModal(props: TitleConfigModalProps) {
  if (!props.show) {
    return null;
  }
  return (
    <Modal title={props.title} show={props.show} onClose={props.onClose}>
      <LabelledInput<string>
        key="title"
        label="title"
        input={props.label ?? ''}
        updateValue={props.setLabel}
      />
    </Modal>
  );
}

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
  const [showXModal, setShowXModal] = useState(false);
  const [showYModal, setShowYModal] = useState(false);
  const [showColourModal, setShowColourModal] = useToggle(false);
  const [showAspectModal, setShowAspectModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [mode, setMode] = useState<string>('panAndWheelZoom');
  const interactionsConfig = createInteractionsConfig(
    mode as InteractionModeType
  );

  const overflows = (
    <>
      <ToggleBtn
        label="X axis"
        icon={TbAxisX}
        onToggle={() => {
          setShowXModal(true);
        }}
        value={false}
      />
      <ToggleBtn
        label="Y axis"
        icon={TbAxisY}
        onToggle={() => {
          setShowYModal(true);
        }}
        value={false}
      />
      <ToggleBtn
        label="Aspect ratio"
        icon={MdAspectRatio}
        onToggle={() => {
          setShowAspectModal(true);
        }}
        value={false}
      />
      <ToggleBtn
        label="Title"
        icon={BsCardHeading}
        onToggle={() => {
          setShowTitleModal(true);
        }}
        value={false}
      />
      <GridToggler value={showGrid} onToggle={toggleGrid} />
    </>
  );

  return (
    <>
      <Toolbar overflowChildren={overflows}>
        <InteractionModeToggle
          value={mode}
          onModeChange={setMode}
        ></InteractionModeToggle>
        <Separator />
        <button onClick={() => setShowColourModal(true)}>
          <div className={styles.btnLike}>
            <ColorMapOption option={colorMap} />
          </div>
        </button>
        <Separator />
      </Toolbar>
      <AxisConfigModal
        title="X axis"
        label={xLabel}
        setLabel={setXLabel}
        scaleType={xScaleType}
        setScaleType={setXScaleType}
        onClose={() => setShowXModal(false)}
        show={showXModal}
      ></AxisConfigModal>
      <AxisConfigModal
        title="Y axis"
        label={yLabel}
        setLabel={setYLabel}
        scaleType={yScaleType}
        setScaleType={setYScaleType}
        onClose={() => setShowYModal(false)}
        show={showYModal}
      ></AxisConfigModal>
      <AxisConfigModal
        title="Colour mapping"
        scaleType={heatmapScaleType}
        setScaleType={setHeatmapScaleType}
        colorMap={colorMap}
        setColorMap={setColorMap}
        invertColorMap={invertColorMap}
        toggleColorMapInversion={toggleColorMapInversion}
        domain={props.domain}
        values={props.values.data}
        customDomain={customDomain}
        setCustomDomain={setCustomDomain}
        onClose={() => setShowColourModal(false)}
        show={showColourModal}
      ></AxisConfigModal>
      <AspectConfigModal
        title="Aspect ratio"
        onClose={() => setShowAspectModal(false)}
        show={showAspectModal}
        aspect={aspect}
        setAspect={setAspect}
        aspectType={aspectType}
        setAspectType={setAspectType}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
      ></AspectConfigModal>
      <TitleConfigModal
        title="Set title"
        show={showTitleModal}
        label={title}
        setLabel={setTitle}
        onClose={() => setShowTitleModal(false)}
      />
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
        interactions={interactionsConfig}
      >
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          disabled={mode !== 'selectRegion'}
          addSelection={props.addSelection}
          selections={props.selections}
        />
      </HeatmapVis>
    </>
  );
}

export default HeatmapPlot;
