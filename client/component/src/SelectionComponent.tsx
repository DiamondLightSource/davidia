import { type ModifierKey, useVisCanvasContext } from '@h5web/lib';
import { useMemo } from 'react';
import { Vector3 } from 'three';
import { useThree } from '@react-three/fiber';

import type { PlotSelectionProps } from './models';
import MulticlickSelectionTool from './MulticlickSelectionTool';
import {
  SelectionType,
  getClicks,
  getSelectionType,
  makeShapes,
  pointsToSelection,
  pointsToShape,
  validateHtml,
} from './selections/utils';

/**
 * Props for the `SelectionComponent` component.
 */
interface SelectionComponentProps extends PlotSelectionProps {
  /** Maximum number of current type */
  selectionMax: number;
  /** The selection type (optional) */
  selectionType?: SelectionType;
  /** The modifier key(s) */
  modifierKey: ModifierKey | ModifierKey[];
  /** If disabled (optional) */
  disabled?: boolean;
}

/**
 * Render a selection component.
 * @param {SelectionComponentProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function SelectionComponent(props: SelectionComponentProps) {
  const {
    disabled = false,
    selectionMax = 0,
    selectionType = SelectionType.rectangle,
    selections = [],
    updateSelection,
    batonProps,
  } = props;
  const alpha = 0.3;

  const { canvasBox, dataToHtml } = useVisCanvasContext();
  const size = canvasBox.size;

  const shapes = useMemo(() => {
    if (updateSelection != null)
      return makeShapes(
        size,
        selections,
        batonProps?.hasBaton ?? true,
        updateSelection
      );
  }, [size, selections, updateSelection, batonProps?.hasBaton]);

  const camera = useThree((state) => state.camera);
  const isFlipped = useMemo(() => {
    // @ts-expect-error: workaround until r3f v9
    const o = dataToHtml(camera, new Vector3(0, 0));
    // @ts-expect-error: workaround until r3f v9
    const v = dataToHtml(camera, new Vector3(1, 1)).sub(o);
    return [v.x < 0, v.y < 0] as [boolean, boolean];
  }, [camera, dataToHtml]);

  const maxReached = useMemo(() => {
    if (selectionMax === 0) {
      return false;
    }
    const n = selections.reduce(
      (a, v) => a + (getSelectionType(v) === selectionType ? 1 : 0),
      0
    );
    return n >= selectionMax;
  }, [selectionMax, selectionType, selections]);

  const clicks = useMemo(() => getClicks(selectionType), [selectionType]);

  return (
    <>
      {updateSelection &&
        (batonProps?.hasBaton ?? true) &&
        !disabled &&
        !maxReached && (
          <MulticlickSelectionTool
            modifierKey={props.modifierKey}
            validate={({ html }) => validateHtml(html, selectionType)}
            onValidSelection={({ data }) => {
              const s = pointsToSelection(
                selections,
                selectionType,
                data,
                alpha
              );
              return updateSelection(s);
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
