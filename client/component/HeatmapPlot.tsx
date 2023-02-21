import '@h5web/lib/dist/styles.css';
import {
  AxisParams,
  GridToggler,
  HeatmapVis,
  Separator,
  Toolbar,
  getVisDomain,
  ModifierKey,
} from '@h5web/lib';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

import { AspectConfigModal } from './AspectConfigModal';
import { AxisConfigModal } from './AxisConfigModal';
import { InteractionModeToggle } from './InteractionModeToggle';
import { LabelledInput } from './LabelledInput';
import { SelectionComponent } from './SelectionComponent';
import { createInteractionsConfig, getAspectType } from './utils';

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
  const [showZModal, setShowZModal] = useState(false);
  const [showAspectModal, setShowAspectModal] = useState(false);
  const [mode, setMode] = useState<string>('panAndWheelZoom');
  const interactionsConfig = createInteractionsConfig(
    mode as InteractionModeType
  );

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
        <button onClick={() => setShowZModal(true)}> Colour</button>
        <button onClick={() => setShowAspectModal(true)}> Aspect</button>
        <AxisConfigModal
          title={'x axis'}
          label={xLabel}
          setLabel={setXLabel}
          scaleType={xScaleType}
          setScaleType={setXScaleType}
          onClose={() => setShowXModal(false)}
          show={showXModal}
        ></AxisConfigModal>
        <AxisConfigModal
          title={'y axis'}
          label={yLabel}
          setLabel={setYLabel}
          scaleType={yScaleType}
          setScaleType={setYScaleType}
          onClose={() => setShowYModal(false)}
          show={showYModal}
        ></AxisConfigModal>
        <AxisConfigModal
          title={'Colour'}
          scaleType={heatmapScaleType}
          setScaleType={setHeatmapScaleType}
          colorMap={colorMap}
          setColorMap={setColorMap}
          invertColorMap={invertColorMap}
          toggleColorMapInversion={toggleColorMapInversion}
          domain={props.domain}
          customDomain={customDomain}
          setCustomDomain={setCustomDomain}
          onClose={() => setShowZModal(false)}
          show={showZModal}
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
