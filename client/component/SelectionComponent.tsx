import '@h5web/lib/dist/styles.css';
import {
  Box,
  ModifierKey,
  Rect,
  SelectionTool,
  SvgElement,
  SvgRect,
} from '@h5web/lib';
import { makeRects, rectToSelection } from './selections';

interface SelectionComponentProps extends PlotSelectionProps {
  modifierKey: ModifierKey | ModifierKey[];
  disabled?: boolean;
}

export function SelectionComponent(props: SelectionComponentProps) {
  const selections = makeRects(props.selections);
  const disabled = props.disabled ?? false;

  return (
    <>
      {!disabled && (
        <SelectionTool
          modifierKey={props.modifierKey}
          validate={({ html }) => Box.fromPoints(...html).hasMinSize(20)}
          onValidSelection={({ data }) => {
            props.addSelection(rectToSelection(data));
          }}
        >
          {({ html: htmlSelection }, _, isValid) => (
            <SvgElement>
              <SvgRect
                coords={htmlSelection as Rect}
                fill={isValid ? 'blue' : 'orangered'}
                fillOpacity="0.3"
              />
            </SvgElement>
          )}
        </SelectionTool>
      )}
      {selections}
    </>
  );
}
