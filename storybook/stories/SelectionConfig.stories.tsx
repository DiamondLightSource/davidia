import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import { IoShapesOutline } from 'react-icons/io5';
import {
  BaseSelection,
  SelectionBase,
  SelectionConfig,
} from '@davidia/component';
import { Domain } from '@h5web/lib';
import { IconType } from 'react-icons';

const meta: Meta<typeof SelectionConfig> = {
  title: 'Toolbar components/SelectionConfig',
  component: SelectionConfig,
  tags: ['autodocs'],
};

export default meta;

const bSelection0 = new BaseSelection([2, 3]);
const bSelection1 = new BaseSelection([5, 1]);
const selections = [bSelection0, bSelection1];
const showSelectionConfig = true;

export const Dynamic: StoryObj<typeof SelectionConfig> = {
  args: {
    title: 'Selection Config Example',
    selections: selections,
    currentSelectionID: bSelection0.id,
    showSelectionConfig: showSelectionConfig,
    label: 'label',
    domain: [0, 5] as Domain,
    customDomain: [0, 5],
  },
  render: function Render(args) {
    const updateArgs = useArgs()[1];

    function onSelectionChange(s: SelectionBase | null) {
      if (s != null) {
        updateArgs({ selections: selections.concat([s as BaseSelection]) });
      }
    }

    function onSelectionIDChange(v: string | null) {
      if (v != null) {
        updateArgs({ currentSelectionID: v });
      }
    }

    function updateShowSelectionConfig() {
      updateArgs({ showSelectionConfig: !showSelectionConfig });
    }

    return (
      <SelectionConfig
        {...args}
        updateCurrentSelectionID={onSelectionIDChange}
        updateSelections={onSelectionChange}
        updateShowSelectionConfig={updateShowSelectionConfig}
        hasBaton={true}
        icon={IoShapesOutline as IconType}
      />
    );
  },
};
