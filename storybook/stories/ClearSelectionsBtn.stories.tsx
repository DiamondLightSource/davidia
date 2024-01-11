import { useState } from 'react';
import type { StoryObj } from '@storybook/react';
import {
  ClearSelectionsBtnProps,
  ClearSelectionsBtn,
  BaseSelection,
  SelectionBase,
} from '@davidia/component';

const meta = {
  title: 'Toolbar components/ClearSelectionsBtn',
  component: ClearSelectionsBtn,
  tags: ['autodocs'],
};

export default meta;

const ComponentWithHooks = () => {
  const selection = { start: [0, 10] } as BaseSelection;
  const [selections, setSelections] = useState<BaseSelection[]>([selection]);
  const [selectionID, setSelectionID] = useState<string>(selection.id);
  const props: ClearSelectionsBtnProps = {
    selections: selections,
    updateSelections: (
      s: SelectionBase | null,
      b?: boolean | undefined,
      d?: boolean | undefined
    ) => {
      if (s != null) {
        setSelections(s);
      }
    },
    currentSelectionID: selectionID,
    updateCurrentSelectionID: (s: string | null) => {
      if (s != null) {
        setSelectionID(s);
      }
    },
    disabled: false,
  };
  return <ClearSelectionsBtn {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
  render: () => <ComponentWithHooks />,
};
