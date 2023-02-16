import '@h5web/lib/dist/styles.css';
import {
  SurfaceVis,
  Separator,
  ToggleBtn,
  Toolbar,
  getVisDomain,
} from '@h5web/lib';
import { ArcballControls } from '@react-three/drei';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

import { AxisConfigModal } from './AxisConfigModal';

function SurfacePlot(props: SurfacePlotProps) {
  const [colorMap, setColorMap] = useState<ColorMap>(
    props.colorMap ?? ('Warm' as ColorMap)
  );
  const [invertColorMap, toggleColorMapInversion] = useToggle();
  const [showPoints, togglePoints] = useToggle();
  const [customDomain, setCustomDomain] = useState<CustomDomain>([
    ...props.domain,
  ]);
  const [surfaceScaleType, setSurfaceScaleType] = useState<ScaleType>(
    props.surfaceScale
  );
  const [showZModal, setShowZModal] = useState(false);

  return (
    <>
      <Toolbar>
        <button onClick={() => setShowZModal(true)}> Z axis config</button>
        <AxisConfigModal
          title={'color bar'}
          scaleType={surfaceScaleType}
          setScaleType={setSurfaceScaleType}
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
        <Separator />
        <ToggleBtn
          label={'Points'}
          value={showPoints}
          onToggle={togglePoints}
        />
        <Separator />
      </Toolbar>
      <SurfaceVis
        dataArray={props.values}
        domain={getVisDomain(customDomain, props.domain)}
        colorMap={colorMap}
        invertColorMap={invertColorMap}
        scaleType={surfaceScaleType}
        showPoints={showPoints}
      >
        <ArcballControls />
      </SurfaceVis>
    </>
  );
}

export default SurfacePlot;
