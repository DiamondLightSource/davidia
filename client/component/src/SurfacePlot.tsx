import {
  type ColorMap,
  type ColorScaleType,
  type CustomDomain,
  Domain,
  SurfaceVis,
  Separator,
  ToggleBtn,
  getVisDomain,
} from '@h5web/lib';
import { useToggle } from '@react-hookz/web';
import { ArcballControls } from '@react-three/drei';
import { useState } from 'react';
import { TbGridDots } from 'react-icons/tb';

import PlotToolbar from './PlotToolbar';
import type { IIconType } from './Modal';
import type { NDT, PlotBaseProps } from './AnyPlot';

/**
 * Represent surface data
 */
interface SurfaceData {
  /** The object key */
  key: string;
  /** The height values for the surface */
  heightValues: NDT;
  /** The domain of the surface data */
  domain: Domain;
  /** The colour scale type */
  surfaceScale: ColorScaleType;
  /** The colour map (optional) */
  colourMap?: ColorMap;
}

/**
 * Props for the `SurfacePlot` component.
 */
interface SurfacePlotProps extends PlotBaseProps, SurfaceData {}

/**
 * Render a surface plot.
 * @param {SurfacePlotProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function SurfacePlot(props: SurfacePlotProps) {
  const [colourMap, setColourMap] = useState<ColorMap>(
    props.colourMap ?? 'Warm'
  );
  const [invertColourMap, toggleInvertColourMap] = useToggle();
  const [showGrid, toggleShowGrid] = useToggle();
  const [title, setTitle] = useState(props.plotConfig.title ?? '');
  const [xLabel, setXLabel] = useState(props.plotConfig.xLabel ?? 'x axis');
  const [yLabel, setYLabel] = useState(props.plotConfig.yLabel ?? 'y axis');
  const [customDomain, setCustomDomain] = useState<CustomDomain>([null, null]);
  const [showPoints, toggleShowPoints] = useToggle();
  const [surfaceScaleType, setSurfaceScaleType] = useState<ColorScaleType>(
    props.surfaceScale
  );

  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <PlotToolbar
        showGrid={showGrid}
        toggleShowGrid={toggleShowGrid}
        title={title}
        setTitle={setTitle}
        xLabel={xLabel}
        setXLabel={setXLabel}
        yLabel={yLabel}
        setYLabel={setYLabel}
        batonProps={props.batonProps}
        dDomain={props.domain}
        dCustomDomain={customDomain}
        setDCustomDomain={setCustomDomain}
        dData={props.heightValues.data}
        dScaleType={surfaceScaleType}
        setDScaleType={setSurfaceScaleType}
        colourMap={colourMap}
        setColourMap={setColourMap}
        invertColourMap={invertColourMap}
        toggleInvertColourMap={toggleInvertColourMap}
      >
        <ToggleBtn
          key="show points"
          label="show points"
          icon={TbGridDots as IIconType}
          iconOnly
          value={showPoints}
          onToggle={toggleShowPoints}
        />
        <Separator />
      </PlotToolbar>
      <SurfaceVis
        dataArray={props.heightValues}
        domain={getVisDomain(customDomain, props.domain)}
        colorMap={colourMap}
        invertColorMap={invertColourMap}
        scaleType={surfaceScaleType}
        showPoints={showPoints}
      >
        <ArcballControls />
      </SurfaceVis>
    </div>
  );
}

export default SurfacePlot;
export type { SurfaceData, SurfacePlotProps };
