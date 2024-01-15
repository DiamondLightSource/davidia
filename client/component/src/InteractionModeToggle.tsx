import { useEffect } from 'react';
import { IoShapesOutline } from 'react-icons/io5';
import { TbZoomInArea, TbZoomPan } from 'react-icons/tb';

import { ToggleGroup } from '@h5web/lib';
import type { IIconType } from './Modal';
import { InteractionModeType } from './utils';

/**
 * The props for the `InteractionModeToggle` component.
 * @interface {object} InteractionModeToggleProps
 * @member {InteractionModeType} value - The interaction mode.
 * @member {(value: string) => void} onModeChange - Handles change of mode.
 * @member {boolean} hasBaton - If client holds baton.
 */
interface InteractionModeToggleProps {
  /** The interaction mode */
  value: InteractionModeType;
  /** Handles change of mode */
  onModeChange: (value: InteractionModeType) => void;
  /** If client holds baton */
  hasBaton: boolean;
}

/**
 *
 * Renders a toggle button for interaction mode.
 * @param {InteractionModeToggleProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function InteractionModeToggle(props: InteractionModeToggleProps) {
  const { value, onModeChange, hasBaton } = props;

  useEffect(() => {
    if (!hasBaton && value === InteractionModeType.selectRegion) {
      onModeChange(InteractionModeType.panAndWheelZoom);
    }
  }, [value, onModeChange, hasBaton]);

  return (
    <>
      <ToggleGroup
        role="radiogroup"
        ariaLabel="mode"
        value={value}
        onChange={(v: string) => onModeChange(v as InteractionModeType)}
      >
        <ToggleGroup.Btn
          label={decodeURI(
            'pan & wheel zoom%0A      alt: x-only%0A     shift: y-only'
          )}
          iconOnly
          icon={TbZoomPan as IIconType}
          value={InteractionModeType.panAndWheelZoom}
        />
        <ToggleGroup.Btn
          label={decodeURI('select to zoom%0A   alt: x-only%0A  shift: y-only')}
          iconOnly
          icon={TbZoomInArea as IIconType}
          value={InteractionModeType.selectToZoom}
        />
        <div // wrapper hack to add tooltip (note corners are not correctly drawn for this last child)
          style={{
            pointerEvents: hasBaton ? 'inherit' : 'auto',
            display: 'inline-flex',
          }}
          title={hasBaton ? '' : 'need baton'}
        >
          <ToggleGroup.Btn
            label="select region"
            iconOnly
            icon={IoShapesOutline as IIconType}
            value={InteractionModeType.selectRegion}
            disabled={!hasBaton}
          />
        </div>
      </ToggleGroup>
    </>
  );
}

export default InteractionModeToggle;
export type { InteractionModeToggleProps };
