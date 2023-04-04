import {
  Box,
  ModifierKey,
  SelectionTool,
  useVisCanvasContext,
} from '@h5web/lib';
import { useMemo } from 'react';

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
  const def = { colour: 'blue', alpha: 0.3 };
  const selectionType = props.selectionType ?? SelectionType.line;

  const context = useVisCanvasContext();
  const { canvasBox } = context;
  const size = canvasBox.size;

  const selections = useMemo(() => {
    return makeShapes(size, props.selections, props.addSelection);
  }, [size, props.selections, props.addSelection]);

  return (
    <>
      {!disabled && (
        <SelectionTool
          modifierKey={props.modifierKey}
          validate={({ html }) => Box.fromPoints(...html).hasMinSize(20)}
          onValidSelection={({ data }) => {
            const s = pointsToSelection(
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
              isValid ? def.colour : 'orangered',
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
