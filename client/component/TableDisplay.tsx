import '@h5web/lib/dist/styles.css';
import {
  CellWidthInput,
  MatrixVis,
  Separator,
  ToggleGroup,
  Toolbar,
} from '@h5web/lib';

import { useEffect, useState } from 'react';

function TableDisplay(props: TableDisplayProps) {
  function calculateFormat(
    displayStyle: TableDisplayType,
    numberDigits: number
  ): Intl.NumberFormat {
    return new Intl.NumberFormat('en', {
      notation: displayStyle,
      maximumFractionDigits:
        displayStyle === 'standard' ? Math.max(numberDigits, 0) : undefined,
      maximumSignificantDigits:
        displayStyle !== 'standard' ? Math.max(numberDigits, 1) : undefined,
    });
  }

  const [displayStyle, setDisplayStyle] = useState(
    props.displayParams?.displayType ?? 'standard'
  );
  const [numberDigits, setNumberDigits] = useState(
    props.displayParams?.numberDigits ?? 2
  );
  const [cellWidth, setCellWidth] = useState(props.cellWidth);
  const [numFmt, setNumFmt] = useState(
    calculateFormat(displayStyle, numberDigits)
  );

  useEffect(() => {
    console.log('numberDigits is ', numberDigits);
    setNumFmt(calculateFormat(displayStyle, numberDigits));
  }, [displayStyle, numberDigits]);

  function updateDisplayStyle(style: string) {
    setDisplayStyle(style as TableDisplayType);
  }

  function handleChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const { value: newValue } = evt.currentTarget;
    const isValid = !newValue || validateNumberField(newValue);
    if (isValid) {
      setNumberDigits(newValue ? Number(newValue) : 0);
    }
  }

  function validateNumberField(value: string) {
    const numbers = /^[0-9]+$/;
    if (value.match(numbers)) {
      return Number(value) >= 0 && Number(value) < 10;
    }
  }

  const formatter = (val: unknown, _column: number): string => {
    return typeof val === 'number' || typeof val == 'bigint'
      ? numFmt.format(val)
      : '';
  };
  return (
    <>
      <Toolbar>
        <CellWidthInput
          value={cellWidth}
          defaultValue={120}
          onChange={setCellWidth}
        />
        <Separator />
        <ToggleGroup
          role="radiogroup"
          ariaLabel="displayStyle"
          value={displayStyle}
          onChange={updateDisplayStyle}
        >
          <ToggleGroup.Btn label="standard" value="standard" />
          <ToggleGroup.Btn label="scientific" value="scientific" />
        </ToggleGroup>
        <Separator />
        <label style={{ display: 'flex', alignItems: 'center' }}>digits:</label>
        <input
          type="text"
          pattern="[0-9]"
          name="digits"
          size={1}
          required
          onChange={handleChange}
          value={String(numberDigits)}
        />
        <Separator />
      </Toolbar>
      <MatrixVis
        cellWidth={cellWidth}
        dataArray={props.dataArray}
        formatter={formatter}
      />
    </>
  );
}

export default TableDisplay;
