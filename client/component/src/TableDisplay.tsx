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
import type { BatonProps, NDT } from './models';

/** Number represent in table */
type TableDisplayType = 'scientific' | 'standard';

/**
 * Parameters for `TableDisplay`.
 */
interface TableDisplayParams {
  /** The table display type (optional) */
  displayType?: TableDisplayType;
  /** The number of digits to display for each data value (optional) */
  numberDigits?: number;
}

/** Represent table data */
interface TableData {
  /** The cell values */
  cellValues: NDT;
  /** The cell width */
  cellWidth: number;
  /** The parameters for the table display (optional) */
  displayParams?: TableDisplayParams;
}

/**
 * Props for the `TableDisplay` component.
 */
interface TableDisplayProps extends TableData {
  /** The baton props */
  batonProps?: BatonProps;
}

/**
 * Render a table display.
 * @param {TableDisplayProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function TableDisplay(props: TableDisplayProps) {
  function calculateFormat(
    displayStyle: TableDisplayType,
    numberDigits: number
  ): Intl.NumberFormat {
    const isStandard = displayStyle === 'standard';
    return new Intl.NumberFormat('en', {
      notation: displayStyle,
      maximumFractionDigits: isStandard ? Math.max(numberDigits, 0) : undefined,
      maximumSignificantDigits: !isStandard
        ? Math.max(numberDigits, 1)
        : undefined,
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

  const formatter = (row: number, col: number): string => {
    const val = props.cellValues.get(row, col);
    return numFmt.format(val);
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
        dims={props.cellValues.shape}
        cellFormatter={formatter}
      />
    </div>
  );
}

export default TableDisplay;
export type {
  TableData,
  TableDisplayParams,
  TableDisplayProps,
  TableDisplayType,
};
