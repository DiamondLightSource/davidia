import { useState } from 'react';
import type { StoryObj } from '@storybook/react';
import { IoShapesOutline } from 'react-icons/io5';
import {
  BaseSelection,
  SelectionBase,
  SelectionConfig,
  SelectionConfigProps,
} from '@davidia/component';

const meta = {
  title: 'Toolbar components/SelectionConfig',
  component: SelectionConfig,
  tags: ['autodocs'],
};

export default meta;

const bSelection0 = new BaseSelection([2, 3]);
const bSelection1 = new BaseSelection([5, 1]);
const ComponentWithHooks = () => {
  const [selection, setSelection] = useState<string>(bSelection0.id);
  const [showSelection, setShowSelection] = useState<boolean>(true);
  const props: SelectionConfigProps = {
    title: 'Selection Config Example',
    selections: [bSelection0, bSelection1],
    updateSelections: (
      _s: SelectionBase | null,
      _b?: boolean | undefined,
      _c?: boolean | undefined
    ) => {},
    currentSelectionID: selection,
    updateCurrentSelectionID: (s: string | null) => {
      if (s != null) {
        setSelection(s);
      }
    },
    showSelectionConfig: showSelection,
    updateShowSelectionConfig: (s: boolean) => {
      setShowSelection(s);
    },
    hasBaton: true,
    icon: IoShapesOutline,
    label: 'label',
    domain: [0, 5],
    customDomain: [0, 5],
  };
  return <SelectionConfig {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
  render: () => <ComponentWithHooks />,
};
