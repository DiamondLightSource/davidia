import {
  type ColorMap,
  type ColorScaleType,
  Domain,
  SurfaceVis,
  Separator,
  ToggleBtn,
  getVisDomain,
} from '@h5web/lib';
import { useToggle } from '@react-hookz/web';
import { ArcballControls } from '@react-three/drei';
import { TbGridDots } from 'react-icons/tb';

import type { IIconType } from './Modal';
import type { BatonProps, NDT, PlotConfig } from './models';
import {
  PlotCustomizationContextProvider,
  usePlotCustomizationContext,
} from './PlotCustomizationContext';
import { AnyToolbar } from './PlotToolbar';

interface Props {
  values: NDT;
  showPoints: boolean;
  children?: React.ReactNode;
}

function SurfaceVisCanvas({ values, showPoints, children }: Props) {
  const { dDomain, dCustomDomain, colourMap, invertColourMap, dScaleType } =
    usePlotCustomizationContext();

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
  const [showPoints, toggleShowPoints] = useToggle();

  const extraChildren = (
    <>
      <ToggleBtn
        key="show points"
        label="show points"
        icon={TbGridDots as IIconType}
        iconOnly
        value={showPoints}
        onToggle={toggleShowPoints}
      />
      <Separator />
    </>
  );

  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <PlotCustomizationContextProvider {...props}>
        <AnyToolbar extraChildren={extraChildren}>
          {props.customToolbarChildren}
        </AnyToolbar>

        <SurfaceVisCanvas values={props.heightValues} showPoints={showPoints} />
      </PlotCustomizationContextProvider>
    </div>
  );
}

export default SurfacePlot;
export type { SurfaceData, SurfacePlotProps };
