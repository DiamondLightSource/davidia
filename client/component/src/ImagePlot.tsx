import { Aspect, type AxisParams, type ModifierKey, RgbVis } from '@h5web/lib';

import SelectionComponent from './SelectionComponent';
import { createInteractionsConfig, InteractionModeType } from './utils';
import type { PlotBaseProps, NDT } from './models';
import {
  PlotCustomizationContextProvider,
  usePlotCustomizationContext,
} from './PlotCustomizationContext';
import { AnyToolbar } from './PlotToolbar';

interface Props {
  xValues?: NDT;
  yValues?: NDT;
  values: NDT;
}

export function ImageVisCanvas({ xValues, yValues, values }: Props) {
  const {
    title,
    showGrid,
    xLabel,
    yLabel,
    mode,
    aspect,
    batonProps,
    canSelect,
    selectionType,
    updateSelection,
    selections,
  } = usePlotCustomizationContext();
  const interactionsConfig = createInteractionsConfig(mode);

  return (
    <RgbVis
      dataArray={values}
      aspect={aspect}
      showGrid={showGrid}
      title={title}
      abscissaParams={
        {
          label: xLabel,
          value: xValues?.data,
        } as AxisParams
      }
      ordinateParams={
        {
          label: yLabel,
          value: yValues?.data,
        } as AxisParams
      }
      interactions={interactionsConfig}
      flipYAxis
    >
      {canSelect && (
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          disabled={mode !== InteractionModeType.selectRegion}
          selectionType={selectionType}
          batonProps={batonProps}
          updateSelection={updateSelection}
          selections={selections}
        />
      )}
    </RgbVis>
  );
}

/**
 * Represent image data
 */
interface ImageData {
  /** pixel values */
  values: NDT;
  /** aspect ratio */
  aspect?: Aspect;
}

/**
 * Props for the `ImagePlot` component
 */
interface ImagePlotProps extends PlotBaseProps, ImageData {}

type ImagePlotCustomizationProps = Omit<ImagePlotProps, 'values'>;

/**
 * Render an image plot.
 * @param {ImagePlotProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function ImagePlot(props: ImagePlotProps) {
  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <PlotCustomizationContextProvider {...props}>
        <AnyToolbar>{props.customToolbarChildren}</AnyToolbar>
        <ImageVisCanvas
          xValues={props.plotConfig.xValues}
          yValues={props.plotConfig.yValues}
          values={props.values}
        />
      </PlotCustomizationContextProvider>
    </div>
  );
}

export default ImagePlot;
export type { ImageData, ImagePlotProps, ImagePlotCustomizationProps };
