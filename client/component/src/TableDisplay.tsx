import {
  CellWidthInput,
  MatrixVis,
  Separator,
  ToggleGroup,
  Toolbar,
} from '@h5web/lib';

import { useEffect, useState } from 'react';

import LabelledInput from './LabelledInput';
import { isValidNumber } from './utils';
import type {
  MP_NDArray,
  TableDisplayParams,
  TableDisplayProps,
  TableDisplayType,
} from './AnyPlot';

/**
 *
 * Represents table data.
 * @interface TableData
 * @member {string} key - The key.
 * @member {MP_NDArray} values - The table data values.
 * @member {number} cellWidth - The individual cell width.
 * @member {TableDisplayParams} [displayParams] - The table display parameters.
 */
interface TableData {
  key: string;
  dataArray: MP_NDArray;
  cellWidth: number;
  displayParams?: TableDisplayParams;
}

/**
 *
 * Renders a table display.
 * @param {TableDisplayProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
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
  const [cellWidth, setCellWidth] = useState<number | undefined>(
    props.cellWidth
  );
  const [numFmt, setNumFmt] = useState(
    calculateFormat(displayStyle, numberDigits)
  );
  const defaultWidth = 120;

  useEffect(() => {
    console.log('numberDigits is ', numberDigits);
    setNumFmt(calculateFormat(displayStyle, numberDigits));
  }, [displayStyle, numberDigits]);

  function updateDisplayStyle(style: string) {
    setDisplayStyle(style as TableDisplayType);
  }

  const formatter = (val: unknown, _column: number): string => {
    return typeof val === 'number' || typeof val === 'bigint'
      ? numFmt.format(val)
      : '';
  };
  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <Toolbar>
        <CellWidthInput
          key="cell width input"
          value={cellWidth}
          defaultValue={defaultWidth}
          onChange={setCellWidth}
        />
        <Separator />
        <ToggleGroup
          key="display style toggle"
          role="radiogroup"
          ariaLabel="displayStyle"
          value={displayStyle}
          onChange={updateDisplayStyle}
        >
          <ToggleGroup.Btn label="standard" value="standard" />
          <ToggleGroup.Btn label="scientific" value="scientific" />
        </ToggleGroup>
        <Separator />
        <LabelledInput<number>
          key="0"
          label="digits"
          input={numberDigits}
          isValid={(v) =>
            isValidNumber(v, displayStyle === 'standard' ? 0 : 1, 10)
          }
          inputAttribs={{
            name: 'digits',
            pattern: '^\\d$',
            size: 1,
          }}
          updateValue={setNumberDigits}
        />
        <Separator />
      </Toolbar>
      <MatrixVis
        cellWidth={cellWidth ?? defaultWidth}
        dataArray={props.dataArray}
        formatter={formatter}
      />
    </div>
  );
}

export default TableDisplay;
export type { TableData };
