import { Box, ModifierKey, SelectionTool } from '@h5web/lib';

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
  const selections = makeShapes(props.selections);
  const disabled = props.disabled ?? false;
  const def = { colour: 'blue', alpha: 0.3 };
  const selectionType = props.selectionType ?? SelectionType.rectangle;

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
              def.alpha
            )
          }
        </SelectionTool>
      )}
      {selections}
    </>
  );
}
