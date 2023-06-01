import {
  Box,
  ModifierKey,
  SelectionTool,
  useVisCanvasContext,
} from '@h5web/lib';
import { useMemo } from 'react';
import { Vector3 } from 'three';
import { useThree } from '@react-three/fiber';

import {
  SelectionType,
  makeShapes,
  pointsToSelection,
  pointsToShape,
} from './selections';

interface SelectionComponentProps extends PlotSelectionProps {
  selectionType?: SelectionType;
  modifierKey: ModifierKey | ModifierKey[];
  disabled?: boolean;
}

export function SelectionComponent(props: SelectionComponentProps) {
  const disabled = props.disabled ?? false;
  const def = { colour: '#0000FF', alpha: 0.3 };
  const selectionType = props.selectionType ?? SelectionType.rectangle;

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
          validate={({ html }) => Box.fromPoints(...html).hasMinSize(20)}
          onValidSelection={({ data }) => {
            const s = pointsToSelection(
              props.selections,
              selectionType,
              data,
              def.colour,
              def.alpha
            );
            return props.addSelection(s);
          }}
        >
          {({ html: htmlSelection }, _, isValid) =>
            pointsToShape(
              selectionType,
              htmlSelection,
              isFlipped,
              isValid ? def.colour : '#ff5349',
              def.alpha,
              size
            )
          }
        </SelectionTool>
      )}
      {selections}
    </>
  );
}
