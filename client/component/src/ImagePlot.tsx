import { Aspect, type AxisParams, type ModifierKey, RgbVis } from '@h5web/lib';

import SelectionComponent from './SelectionComponent';
import { createInteractionsConfig, InteractionModeType } from './utils';
import type { PlotBaseProps, NDT } from './models';
import {
  PlotCustomizationContextProvider,
  usePlotCustomizationContext,
} from './PlotCustomizationContext';
import { AnyToolbar } from './PlotToolbar';
import { useRef } from 'react';

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
    selectionMax,
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
          selectionMax={selectionMax}
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
  const refContainer = useRef<HTMLDivElement>(null);

  // From h5web/packages/lib/src/vis/utils.ts
  const DEFAULT_AXIS_OFFSETS = { left: 80, right: 24, top: 16, bottom: 34 };
  const TITLE_OFFSET = 28;
  const LABEL_OFFSET = 24;

   /**
  * This block determines which dimension is the size contraint and then calculates the
  * maximum size that the other dimension can be in order for the image aspect ratio to 
  * be maintained, accounting for the padding that h5web applies.
  */
  let aspect;
  if(refContainer.current && props.aspect === "equal") {
    const imageAspect = props.values.shape[1] / props.values.shape[0];
    const divAspect = refContainer.current.offsetWidth / refContainer.current.offsetHeight;


    if (imageAspect > divAspect) {
      // If the image is thinner than the allotted space...

      const divWidth = refContainer.current.offsetWidth;

      // How much horizontal padding is needed for titles/labels
      let widthOffset = DEFAULT_AXIS_OFFSETS.left + DEFAULT_AXIS_OFFSETS.right;
      if (props.plotConfig.yLabel) {widthOffset += LABEL_OFFSET}

      // How many pixels can be used for the image width
      const imageDisplayWidth = divWidth - widthOffset;

      // How many px of height that corresponds to
      const imageDisplayHeight =  imageDisplayWidth / imageAspect;
      
      // Div height required for maximum image size, including labels & padding
      let requiredDivHeight = imageDisplayHeight + DEFAULT_AXIS_OFFSETS.top + DEFAULT_AXIS_OFFSETS.bottom;
      if (props.plotConfig.title) {requiredDivHeight += TITLE_OFFSET};
      if (props.plotConfig.xLabel) {requiredDivHeight += LABEL_OFFSET};

      // The canvas aspect required for maximum image size
      aspect = divWidth / requiredDivHeight;
    }
    else {
      // If the image is shorter than the allotted space...

      const divHeight= refContainer.current.offsetHeight;

      // How much vertical padding is needed for titles/labels
      let verticalOffset = DEFAULT_AXIS_OFFSETS.top + DEFAULT_AXIS_OFFSETS.bottom;
      if (props.plotConfig.title) {verticalOffset += TITLE_OFFSET};
      if (props.plotConfig.xLabel) {verticalOffset += LABEL_OFFSET};

      // How many px can be used for image height
      const imageDisplayHeight = divHeight - verticalOffset;

      // How many px of width that corresponds to
      const imageDisplayWidth = imageDisplayHeight * imageAspect;

      // Div width required for maximum image size, including labels & padding
      let containerWidth = imageDisplayWidth + DEFAULT_AXIS_OFFSETS.left + DEFAULT_AXIS_OFFSETS.right;
      if (props.plotConfig.yLabel) {containerWidth += LABEL_OFFSET};

      // The canvas aspect required for maximum image size
      aspect = containerWidth / divHeight;
    }
  }
  else aspect = props.aspect;


  return (
    <div
      style={{
        aspectRatio: aspect,
        display: 'grid',
        position: 'relative',
        minWidth: 0,
        minHeight: 0,
      }}
      ref={refContainer}
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
