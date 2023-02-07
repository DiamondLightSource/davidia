import '@h5web/lib/dist/styles.css';
import {
  Box,
  DataToHtml,
  Rect,
  SelectionTool,
  SvgElement,
  SvgRect,
} from '@h5web/lib';
import { useState } from 'react';

interface SelectionComponentProps<T> {
  updateValue: (value: T) => void;
  input: Rect | undefined;
}

export function SelectionComponent<Rect>(props: SelectionComponentProps<Rect>) {
  const [persistedSelection, setPersistedSelection] = useState(props.input);

  function handleSelectionStart() {
    setPersistedSelection(undefined);
  }

  function handleSelectionEnd(data: Rect | undefined) {
    if (data != undefined) {
      props.updateValue(data);
      setPersistedSelection(data);
    }
  }

  return (
    <>
      <SelectionTool
        modifierKey="Control"
        validate={({ html }) => Box.fromPoints(...html).hasMinSize(20)}
        onSelectionStart={() => handleSelectionStart()}
        onValidSelection={({ data }) => handleSelectionEnd(data as Rect)}
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

      {persistedSelection && (
        <DataToHtml points={persistedSelection}>
          {(...htmlSelection) => (
            <SvgElement>
              <SvgRect coords={htmlSelection} fill="blue" fillOpacity="0.5" />
            </SvgElement>
          )}
        </DataToHtml>
      )}
    </>
  );
}
