import { useState } from 'react';
import type { StoryObj } from '@storybook/react';
import {
  RectangularSelection,
  RectangularSelectionConfig,
  RectangularSelectionConfigProps,
  SelectionBase,
} from '@davidia/component';

const meta = {
  title: 'Toolbar components/RectangularSelectionConfig',
  component: RectangularSelectionConfig,
  tags: ['autodocs'],
};

export default meta;

const ComponentWithHooks = () => {
  const [selection, setSelection] = useState<RectangularSelection>(
    new RectangularSelection([2, 3], [4, 5])
  );
  const props: RectangularSelectionConfigProps = {
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
  return <RectangularSelectionConfig {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
  render: () => <ComponentWithHooks />,
};
