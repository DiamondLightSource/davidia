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
import { PropsWithChildren, useEffect, useMemo } from 'react';
import { calculateHistogramCounts } from './utils';

interface Props {
  values: NDT;
}

export function SurfaceVisCanvas(props: PropsWithChildren<Props>) {
  const { values, children } = props;

  const {
    dDomain,
    dCustomDomain,
    colourMap,
    invertColourMap,
    dScaleType,
    showPoints,
    setHistogram,
  } = usePlotCustomizationContext();

  const visDomain = useMemo(
    () => getVisDomain(dCustomDomain, dDomain),
    [dCustomDomain, dDomain]
  );

  useEffect(() => {
    const histogram = calculateHistogramCounts(values.data, dDomain);

    if (histogram) {
      console.log('Set histogram:', histogram, colourMap, invertColourMap);

      setHistogram({
        ...histogram,
        colorMap: colourMap,
        invertColorMap: invertColourMap,
      });
    }
  }, [dDomain, values, colourMap, invertColourMap, setHistogram]);

  return (
    <SurfaceVis
      dataArray={values}
      domain={visDomain}
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
  domain?: Domain;
  /** The colour scale type */
  surfaceScale?: ColorScaleType;
  /** The colour map (optional) */
  colourMap?: ColorMap;
  /** Show points if true */
  showPoints?: boolean;
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

type SurfacePlotCustomizationProps = Omit<SurfacePlotProps, 'heightValues'>;

/**
 * Render a surface plot.
 * @param {SurfacePlotProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
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
export type { SurfaceData, SurfacePlotProps, SurfacePlotCustomizationProps };
