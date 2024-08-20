import { FaCircle } from 'react-icons/fa';
import { RxCross1 } from 'react-icons/rx';
import { FaSquareFull } from 'react-icons/fa6';
import { MdHorizontalRule } from 'react-icons/md';

import { ToggleGroup } from '@h5web/lib';
import type { IIconType } from './Modal';
import type { GlyphType } from '@h5web/lib';

/**
 * Props for the `GlyphTypeToggle` component.
 */
interface GlyphTypeToggleProps {
  /** The interaction mode */
  value: GlyphType;
  /** Handles change of mode */
  onGlyphTypeChange: (value: GlyphType) => void;
  /** If client holds baton */
  hasBaton: boolean;
}

/**
 * Render a toggle button for interaction mode.
 * @param {GlyphTypeToggleProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function GlyphTypeToggle(props: GlyphTypeToggleProps) {
  const value = props.value ?? ('Circle' as GlyphType);
  const onGlyphTypeChange = props.onGlyphTypeChange;
  const hasBaton = props.hasBaton;
  return (
    <>
      <ToggleGroup
        role="radiogroup"
        ariaLabel="mode"
        value={value}
        onChange={(v: string) => onGlyphTypeChange(v as GlyphType)}
      >
        <ToggleGroup.Btn
          label={'Circle'}
          iconOnly
          icon={FaCircle as IIconType}
          value={'Circle' as GlyphType}
          disabled={!hasBaton}
        />
        <ToggleGroup.Btn
          label={'Cross'}
          iconOnly
          icon={RxCross1 as IIconType}
          value={'Cross' as GlyphType}
          disabled={!hasBaton}
        />
        <ToggleGroup.Btn
          label={'Square'}
          iconOnly
          icon={FaSquareFull as IIconType}
          value={'Square' as GlyphType}
          disabled={!hasBaton}
        />
        <div // wrapper hack to add tooltip (note corners are not correctly drawn for this last child)
          style={{
            pointerEvents: hasBaton ? 'inherit' : 'auto',
            display: 'inline-flex',
          }}
          title={hasBaton ? '' : 'need baton'}
        >
          <ToggleGroup.Btn
            label={'Cap'}
            iconOnly
            icon={MdHorizontalRule as IIconType}
            value={'Cap' as GlyphType}
            disabled={!hasBaton}
          />
        </div>
      </ToggleGroup>
    </>
  );
}

export default GlyphTypeToggle;
export type { GlyphTypeToggleProps };
