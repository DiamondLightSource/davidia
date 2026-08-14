import { Aspect, type ModifierKey, RgbVis } from '@h5web/lib';
import unsqueeze from 'ndarray-unsqueeze';
import tile from 'ndarray-tile';

import SelectionComponent from './SelectionComponent';
import { createInteractionsConfig, InteractionModeType } from './utils';
import type { PlotBaseProps, NDT } from './models';
import {
  PlotCustomizationContextProvider,
  usePlotCustomizationContext,
} from './PlotCustomizationContext';
import { AnyToolbar } from './PlotToolbar';
import { useLayoutEffect, useRef, useState } from 'react';
interface Props {
  xValues?: NDT;
  yValues?: NDT;
  values: NDT;
}

// From h5web/packages/lib/src/vis/utils.ts
const DEFAULT_AXIS_OFFSETS = { left: 80, right: 24, top: 16, bottom: 34 };
const TITLE_OFFSET = 28;
const LABEL_OFFSET = 24;
interface AxisOffsets {
  left: number;
  bottom: number;
  right: number;
  top: number;
}

function getAxisOffsets(
  hasLabel: Partial<Record<Exclude<keyof AxisOffsets, 'right'>, boolean>> = {}
): AxisOffsets {
  const { left, right, top, bottom } = DEFAULT_AXIS_OFFSETS;
  return {
    left: left + (hasLabel.left ? LABEL_OFFSET : 0),
    right,
    top: top + (hasLabel.top ? TITLE_OFFSET : 0),
    bottom: bottom + (hasLabel.bottom ? LABEL_OFFSET : 0),
  };
}

function makeRGB(values: NDT): NDT | null {
  const shape = values.shape;

  if (shape.length == 2) {
    return tile(unsqueeze(values), [1, 1, 3]) as NDT;
  } else if (shape.length == 3) {
    const channels = shape[2];
    if (channels == 1) {
      return tile(values, [1, 1, 3]) as NDT;
    } else if (channels == 3) {
      return values;
    }
  }
  console.log('Shape of array is not compatible with RGB array:', shape);
  return null;
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

  const rgbValues = makeRGB(values);

  return (
    rgbValues && (
      <RgbVis
        dataArray={rgbValues}
        aspect={aspect}
        showGrid={showGrid}
        title={title}
        abscissaParams={{
          label: xLabel,
          value: xValues?.data,
        }}
        ordinateParams={{
          label: yLabel,
          value: yValues?.data,
        }}
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
    )
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
interface ImagePlotProps extends PlotBaseProps, ImageData {
  /**
   * If enabled, forces the plot to shrink or expand to keep the image flush with the axes.
   * Has no effect if the aspect is not equal.
   */
  tightAxes?: boolean;
}

type ImagePlotCustomizationProps = Omit<ImagePlotProps, 'values'>;

/**
 * Render an image plot.
 * @param {ImagePlotProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function ImagePlot(props: ImagePlotProps) {
  const refContainer = useRef<HTMLDivElement>(null);
  const refToolbar = useRef<HTMLDivElement>(null);

  const [divAspect, setDivAspect] = useState<Aspect>();
  const divAspectIsAuto = !(props.tightAxes && props.aspect == 'equal');

  if (divAspectIsAuto && divAspect != 'auto') {
    setDivAspect('auto');
  }

  useLayoutEffect(() => {
    if (divAspectIsAuto) {
      return;
    }

    const computeAspect = () => {
      if (refContainer.current == null) return;

      const toolbarHeight = refToolbar.current?.offsetHeight || 0;

      // Width of the container
      const divWidth = refContainer.current.offsetWidth;

      // Aspect ratio if the image
      const imageAspect = props.values.shape[1] / props.values.shape[0];

      const axisOffsets = getAxisOffsets({
        left: !!props.plotConfig.yLabel,
        bottom: !!props.plotConfig.xLabel,
        top: !!props.plotConfig.title,
      });

      // How much horizontal padding is needed for titles/labels
      const widthOffset = axisOffsets.left + axisOffsets.right;

      // How many pixels can be used for the image width
      const imageDisplayWidth = divWidth - widthOffset;

      // How many px of height that corresponds to
      const imageDisplayHeight = imageDisplayWidth / imageAspect;

      // Div height required for maximum image size, including labels & padding
      const requiredHeight =
        imageDisplayHeight +
        axisOffsets.top +
        axisOffsets.bottom +
        toolbarHeight;

      // The canvas aspect required for maximum image size
      const newAspect = divWidth / requiredHeight;

      if (divAspect != newAspect) {
        setDivAspect(newAspect);
      }
    };

    const observer = new ResizeObserver(() => {
      computeAspect();
    });

    if (refContainer.current != null) {
      observer.observe(refContainer.current);
    }

    return () => observer.disconnect();
  }, [
    divAspectIsAuto,
    refContainer,
    refToolbar,
    props.values.shape,
    props.plotConfig.title,
    props.plotConfig.xLabel,
    props.plotConfig.yLabel,
    divAspect,
    setDivAspect,
  ]);

  return (
    <div
      ref={refContainer}
      style={{
        aspectRatio: divAspect,
        display: 'grid',
        position: 'relative',
        minWidth: 0,
        minHeight: 0,
        maxHeight: '100%',
        maxWidth: '100%',
      }}
    >
      <PlotCustomizationContextProvider {...props}>
        <div ref={refToolbar} style={{ minWidth: 0 }}>
          <AnyToolbar>{props.customToolbarChildren}</AnyToolbar>
        </div>
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
