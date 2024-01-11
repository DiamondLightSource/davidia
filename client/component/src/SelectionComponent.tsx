import { type ModifierKey, useVisCanvasContext } from '@h5web/lib';
import { useMemo } from 'react';
import { Vector3 } from 'three';
import { useThree } from '@react-three/fiber';

import MulticlickSelectionTool from './MulticlickSelectionTool';
import {
  SelectionType,
  getClicks,
  makeShapes,
  pointsToSelection,
  pointsToShape,
  validateHtml,
} from './selections/utils';
import type { BatonProps, PlotSelectionProps } from './AnyPlot';

/**
 * The props for the `SelectionComponent` component.
 * @interface {object} SelectionComponentProps
 * @extends {PlotSelectionProps}
 * @member {SelectionType} [selectionType] - The selection type.
 * @member {ModifierKey | ModifierKey[]} modifierKey - The modifier key(s).
 * @member {BatonProps} batonProps - The baton props.
 * @member {boolean} [disabled] - If disabled.
 */
interface SelectionComponentProps extends PlotSelectionProps {
  /** The selection type (optional) */
  selectionType?: SelectionType;
  /** The modifier key(s) */
  modifierKey: ModifierKey | ModifierKey[];
  /** The baton props */
  batonProps: BatonProps;
  /** If disabled (optional) */
  disabled?: boolean;
}

/**
 *
 * Renders a selection component.
 * @param {SelectionComponentProps} props - The component props.
 * @returns {JSX.Element | null} The rendered component.
 */
function SelectionComponent(props: SelectionComponentProps) {
  const {
    disabled = false,
    selectionType = SelectionType.rectangle,
    selections,
    addSelection,
    batonProps,
  } = props;
  const alpha = 0.3;

  const context = useVisCanvasContext();
  const { canvasBox, dataToHtml } = context;
  const size = canvasBox.size;

  const shapes = useMemo(() => {
    return makeShapes(size, selections, addSelection, batonProps.hasBaton);
  }, [size, selections, addSelection, batonProps.hasBaton]);

  const camera = useThree((state) => state.camera);
  const isFlipped = useMemo(() => {
    const o = dataToHtml(camera, new Vector3(0, 0));
    const v = dataToHtml(camera, new Vector3(1, 1)).sub(o);
    return [v.x < 0, v.y < 0] as [boolean, boolean];
  }, [camera, dataToHtml]);

  const clicks = getClicks(selectionType);

  return (
    <>
      {batonProps.hasBaton && !disabled && (
        <MulticlickSelectionTool
          modifierKey={props.modifierKey}
          validate={({ html }) => validateHtml(html, selectionType)}
          onValidSelection={({ data }) => {
            const s = pointsToSelection(selections, selectionType, data, alpha);
            return addSelection(s);
          }}
          minPoints={clicks[0]}
          maxPoints={clicks[1]}
        >
          {({ html }, _, isValid) =>
            pointsToShape(
              selectionType,
              html,
              isFlipped,
              alpha,
              size,
              isValid ? undefined : '#cc6677' // orangered,
            )
          }
        </MulticlickSelectionTool>
      )}
      {shapes}
    </>
  );
}

export type { SelectionComponentProps };
export default SelectionComponent;
