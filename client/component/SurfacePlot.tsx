import { SurfaceVis, Separator, ToggleBtn, getVisDomain } from '@h5web/lib';
import { useToggle } from '@react-hookz/web';
import { ArcballControls } from '@react-three/drei';
import { useState } from 'react';
import { TbGridDots } from 'react-icons/tb';

import { PlotToolbar } from './PlotToolbar';

function SurfacePlot(props: SurfacePlotProps) {
  const [colorMap, setColorMap] = useState<ColorMap>(props.colorMap ?? 'Warm');
  const [invertColorMap, toggleInvertColorMap] = useToggle();
  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState(props.axesParameters.title ?? '');
  const [xLabel, setXLabel] = useState(props.axesParameters.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.axesParameters.yLabel ?? 'y axis');
  const [customDomain, setCustomDomain] = useState<CustomDomain>(props.domain);
  const [showPoints, toggleShowPoints] = useToggle();
  const [surfaceScaleType, setSurfaceScaleType] = useState<ScaleType>(
    props.surfaceScale
  );

  return (
    <>
      <PlotToolbar
        showGrid={showGrid}
        toggleShowGrid={toggleShowGrid}
        title={title}
        setTitle={setTitle}
        xLabel={xLabel}
        setXLabel={setXLabel}
        yLabel={yLabel}
        setYLabel={setYLabel}
        dDomain={props.domain}
        dCustomDomain={customDomain}
        setDCustomDomain={setCustomDomain}
        values={props.values.data}
        dScaleType={surfaceScaleType}
        setDScaleType={setSurfaceScaleType}
        colorMap={colorMap}
        setColorMap={setColorMap}
        invertColorMap={invertColorMap}
        toggleInvertColorMap={toggleInvertColorMap}
      >
        <ToggleBtn
          key="show points"
          label="show points"
          icon={TbGridDots}
          iconOnly
          value={showPoints}
          onToggle={toggleShowPoints}
        />
        <Separator />
      </PlotToolbar>
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
