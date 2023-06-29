import { ModifierKey, SelectionTool, useVisCanvasContext } from '@h5web/lib';
import { useMemo } from 'react';
import { Vector3 } from 'three';
import { useThree } from '@react-three/fiber';

import {
  SelectionType,
  makeShapes,
  pointsToSelection,
  pointsToShape,
  validateHtml,
} from './selections/utils';

interface SelectionComponentProps extends PlotSelectionProps {
  selectionType?: SelectionType;
  modifierKey: ModifierKey | ModifierKey[];
  disabled?: boolean;
}

export function SelectionComponent(props: SelectionComponentProps) {
  const disabled = props.disabled ?? false;
  const selectionType = props.selectionType ?? SelectionType.rectangle;
  const alpha = 0.3;

  const context = useVisCanvasContext();
  const { canvasBox, dataToHtml } = context;
  const size = canvasBox.size;

  const selections = useMemo(() => {
    return makeShapes(size, props.selections, props.addSelection);
  }, [size, props.selections, props.addSelection]);

  const camera = useThree((state) => state.camera);
  const isFlipped = useMemo(() => {
    const o = dataToHtml(camera, new Vector3(0, 0));
    const v = dataToHtml(camera, new Vector3(1, 1)).sub(o);
    return [v.x < 0, v.y < 0] as [boolean, boolean];
  }, [camera, dataToHtml]);

  return (
    <>
      {!disabled && (
        <SelectionTool
          modifierKey={props.modifierKey}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          validate={({ html }) => validateHtml(html, selectionType)}
          onValidSelection={({ data }) => {
            const s = pointsToSelection(
              props.selections,
              selectionType,
              data,
              alpha
            );
            return props.addSelection(s);
          }}
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
        </SelectionTool>
      )}
      {selections}
    </>
  );
}
