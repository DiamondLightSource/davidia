import { useState } from 'react';
import ndarray from 'ndarray';
import type { StoryObj } from '@storybook/react';
import {
  AnyPlot,
  BatonProps,
  DAxesParameters,
  ImagePlot,
  ImagePlotProps,
  SelectionBase,
} from '@davidia/component';

const meta = {
  title: 'Plots/AnyPlot/Image',
  component: AnyPlot,
  tags: ['autodocs'],
  argTypes: {
    cellWidth: { table: { disable: true } },
    dataArray: { table: { disable: true } },
    dataParams: { table: { disable: true } },
    domain: { table: { disable: true } },
    heatmapScale: { table: { disable: true } },
    colourMap: { table: { disable: true } },
    data: { table: { disable: true } },
    xDomain: { table: { disable: true } },
    yDomain: { table: { disable: true } },
    xData: { table: { disable: true } },
    yData: { table: { disable: true } },
    surfaceScale: { table: { disable: true } },
    displayParams: { table: { disable: true } },
  },
};

export default meta;

const ComponentWithHooks = () => {
  const [selections, setSelections] = useState<SelectionBase[]>([]);

  const batonProps = {
    uuid: '14e9e388',
    batonUuid: '14e9e388',
    others: ['22f4c778', '32g5b835'] as string[],
    hasBaton: true,
    requestBaton: () => ({}),
    approveBaton: (_s: string) => ({}),
  } as BatonProps;

  const props: ImagePlotProps = {
    addSelection: (
      s: SelectionBase | null,
      _broadcast?: boolean | undefined,
      _clear?: boolean | undefined
    ) => {
      if (s != null) {
        setSelections(selections.concat([s]));
      }
    },
    selections: selections,
    batonProps: batonProps,
    values: ndarray(
      new Float32Array([
        255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0, 255, 0, 255, 0, 255, 255, 0,
        165, 0, 128, 0, 128,
      ]),
      [2, 4, 3]
    ),
    axesParameters: {
      title: 'Sample Image Plot',
      xLabel: 'x-axis',
      yLabel: 'y-axis',
    } as DAxesParameters,
    aspect: 'auto',
  };
  return <ImagePlot {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
  render: () => <ComponentWithHooks />,
};
