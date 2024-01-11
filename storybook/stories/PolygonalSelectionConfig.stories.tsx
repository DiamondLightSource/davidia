import { useState } from 'react';
import type { StoryObj } from '@storybook/react';
import {
  PolygonalSelection,
  PolygonalSelectionConfig,
  PolygonalSelectionConfigProps,
  SelectionBase,
} from '@davidia/component';

const meta = {
  title: 'Toolbar components/PolygonalSelectionConfig',
  component: PolygonalSelectionConfig,
  tags: ['autodocs'],
};

export default meta;

const ComponentWithHooks = () => {
  const [selection, setSelection] = useState<PolygonalSelection>(
    new PolygonalSelection(
      [
        [1, 1],
        [1, 2],
        [2, 3],
        [4, 1],
      ] as [number, number][],
      true
    )
  );
  const props: PolygonalSelectionConfigProps = {
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
  return <PolygonalSelectionConfig {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
  render: () => <ComponentWithHooks />,
};
