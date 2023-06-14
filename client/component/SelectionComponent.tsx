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
  dataDomain: number[][] | undefined;
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
          validate={({ html }) =>
            Box.fromPoints(...html).hasMinSize(
              selectionType === SelectionType.horizontalAxis ||
                selectionType === SelectionType.verticalAxis
                ? 0
                : 20
            )
          }
          onValidSelection={({ data }) => {
            const s = pointsToSelection(
              props.selections,
              selectionType,
              [
                new Vector3(
                  props.dataDomain &&
                  selectionType === SelectionType.verticalAxis
                    ? props.dataDomain[0][0]
                    : data[0].x,
                  props.dataDomain &&
                  selectionType === SelectionType.horizontalAxis
                    ? props.dataDomain[1][0]
                    : data[0].y
                ),
                new Vector3(
                  props.dataDomain &&
                  selectionType === SelectionType.verticalAxis
                    ? props.dataDomain[0][1]
                    : data[1].x,
                  props.dataDomain &&
                  selectionType === SelectionType.horizontalAxis
                    ? props.dataDomain[1][1]
                    : data[1].y
                ),
              ],
              alpha
            );
            return props.addSelection(s);
          }}
        >
          {({ html: htmlSelection }, _, isValid) =>
            pointsToShape(
              selectionType,
              [
                new Vector3(
                  props.dataDomain &&
                  selectionType === SelectionType.verticalAxis
                    ? 0
                    : htmlSelection[0].x,
                  props.dataDomain &&
                  selectionType === SelectionType.horizontalAxis
                    ? 0
                    : htmlSelection[0].y
                ),
                new Vector3(
                  props.dataDomain &&
                  selectionType === SelectionType.verticalAxis
                    ? canvasBox.max.x
                    : htmlSelection[1].x,
                  props.dataDomain &&
                  selectionType === SelectionType.horizontalAxis
                    ? canvasBox.max.y
                    : htmlSelection[1].y
                ),
              ],
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
