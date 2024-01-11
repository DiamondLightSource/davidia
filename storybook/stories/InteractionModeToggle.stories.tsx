import { useState } from 'react';
import type { StoryObj } from '@storybook/react';
import {
  InteractionModeToggle,
  InteractionModeToggleProps,
} from '@davidia/component';

const meta = {
  title: 'Toolbar components/InteractionModeToggle',
  component: InteractionModeToggle,
  tags: ['autodocs'],
};

export default meta;

const ComponentWithHooks = () => {
  const [mode, setMode] = useState<string>('selectRegion');
  const props: InteractionModeToggleProps = {
    value: mode,
    onModeChange: (s:string) => {setMode(s)},
    hasBaton: true,
  };
  return <InteractionModeToggle {...props} />;
};

export const Dynamic: StoryObj<typeof ComponentWithHooks> = {
  render: () => <ComponentWithHooks />,
};
