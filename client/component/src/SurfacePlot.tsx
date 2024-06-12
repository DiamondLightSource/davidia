import {
  type ColorMap,
  type ColorScaleType,
  Domain,
  SurfaceVis,
  getVisDomain,
} from '@h5web/lib';
import { ArcballControls } from '@react-three/drei';

import type { BatonProps, NDT, PlotConfig } from './models';
import {
  PlotCustomizationContextProvider,
  usePlotCustomizationContext,
} from './PlotCustomizationContext';
import { AnyToolbar } from './PlotToolbar';

interface Props {
  values: NDT;
  children?: React.ReactNode;
}

export function SurfaceVisCanvas({ values, children }: Props) {
  const {
    dDomain,
    dCustomDomain,
    colourMap,
    invertColourMap,
    dScaleType,
    showPoints,
  } = usePlotCustomizationContext();

  return (
    <SurfaceVis
      dataArray={values}
      domain={getVisDomain(dCustomDomain, dDomain)}
      colorMap={colourMap}
      invertColorMap={invertColourMap}
      scaleType={dScaleType}
      showPoints={showPoints}
    >
      <ArcballControls />
      {children}
    </SurfaceVis>
  );
}

/**
 * Represent surface data
 */
interface SurfaceData {
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
interface SurfacePlotProps extends SurfaceData {
  /** The baton props */
  batonProps?: BatonProps;
  /** The plot configuration */
  plotConfig: PlotConfig;
  /**
   * Children to customize the toolbar. If undefined then use default toolbar, if null, disable toolbar,
   * otherwise use given children
   */
  customToolbarChildren?: React.ReactNode;
}

/**
 * Render a surface plot.
 * @param {SurfacePlotProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function SurfacePlot(props: SurfacePlotProps) {
  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <PlotCustomizationContextProvider {...props}>
        <AnyToolbar>{props.customToolbarChildren}</AnyToolbar>
        <SurfaceVisCanvas values={props.heightValues} />
      </PlotCustomizationContextProvider>
    </div>
  );
}

export default SurfacePlot;
export type { SurfaceData, SurfacePlotProps };
