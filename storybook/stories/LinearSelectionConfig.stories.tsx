import { Vector3 } from 'three';
import { useState } from 'react';
import type { StoryObj } from '@storybook/react';
import {
  LinearSelectionConfig,
  LinearSelection,
  LinearSelectionConfigProps,
  SelectionBase,
} from '@davidia/component';

const meta = {
  title: 'Toolbar components/LinearSelectionConfig',
  component: LinearSelectionConfig,
  tags: ['autodocs'],
};

export default meta;

const ComponentWithHooks = () => {
  const linearSelection = LinearSelection.createFromPoints([
    new Vector3(4, 0, 0),
    new Vector3(19.6, -1.5, 0),
  ]);
  const [selection, setSelection] = useState<LinearSelection>(linearSelection);
  const props: LinearSelectionConfigProps = {
    selection: selection,
    updateSelection: (
      s: SelectionBase | null,
      b?: boolean | undefined,
      c?: boolean | undefined
    ) => {
      if (s != null) {
        setSelection(s);
      }
    },
    disabled: false,
  };
  return <LinearSelectionConfig {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
  render: () => <ComponentWithHooks />,
};
