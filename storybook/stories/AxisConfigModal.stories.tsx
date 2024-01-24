import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import { BsCardHeading } from 'react-icons/bs';
import { ColorMap, ScaleType } from '@h5web/lib';
import { AxisConfigModal } from '@davidia/component';
import { IconType } from 'react-icons';

const meta: Meta<typeof AxisConfigModal> = {
  title: 'Modals/AxisConfigModal',
  component: AxisConfigModal,
  tags: ['autodocs'],
};

export default meta;

export const Dynamic: StoryObj<typeof AxisConfigModal> = {
  args: {
    title: `Example Modal`,
    label: 'modal label',
    scaleType: ScaleType.Linear,
    scaleOptions: [ScaleType.Linear, ScaleType.Log],
    colourMap: 'Cividis' as ColorMap,
    invertColourMap: false,
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function setLabel(s: string) {
      updateArgs({ label: s });
    }

    function setScaleType(s: ScaleType) {
      updateArgs({ scaleType: s });
    }

    function setColorMap(c: ColorMap) {
      updateArgs({ colourMap: c });
    }

    return (
      <AxisConfigModal
        {...args}
        icon={BsCardHeading as IconType}
        setLabel={setLabel}
        setScaleType={setScaleType}
        setColourMap={setColorMap}
      />
    );
  },
};
