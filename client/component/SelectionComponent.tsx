import '@h5web/lib/dist/styles.css';
import { Box, Rect, SelectionTool, SvgElement, SvgRect } from '@h5web/lib';

import { makeRects, rectToSelection } from './selections';

export function SelectionComponent(props: PlotSelectionProps) {
  const selections = makeRects(props.selections);

  return (
    <>
      <SelectionTool
        modifierKey="Shift"
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
      {selections}
    </>
  );
}
