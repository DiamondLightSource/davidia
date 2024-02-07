import { MatrixVis } from '@h5web/lib';
import { useState } from 'react';

import {
  type MP_NDArray,
  type TableDisplayParams,
  type TableDisplayProps,
  type TableDisplayType,
} from '../plots/AnyPlot';
import { TableToolbar } from './TableToolbar';
import { defaultWidth } from './tableConstants';

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

function calculateFormat(
  displayStyle: TableDisplayType,
  numberDigits: number
): Intl.NumberFormat {
  const isStandard = displayStyle === 'standard';

  const options: Intl.NumberFormatOptions = {
    notation: displayStyle,
    maximumFractionDigits: isStandard ? Math.max(numberDigits, 0) : undefined,
    maximumSignificantDigits: isStandard
      ? undefined
      : Math.max(numberDigits, 1),
  };

  return new Intl.NumberFormat('en', options);
}

/**
 *
 * Renders a table display.
 * @param {TableDisplayProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function TableDisplay(props: TableDisplayProps) {
  const [displayStyle, setDisplayStyle] = useState<TableDisplayType>(
    props.displayParams?.displayType ?? 'standard'
  );
  const [numberDigits, setNumberDigits] = useState<number>(
    props.displayParams?.numberDigits ?? 2
  );
  const [cellWidth, setCellWidth] = useState<number>(props.cellWidth);

  // note: derived state that changes on every render
  const numFmt = calculateFormat(displayStyle, numberDigits);

  const matrixCellFormatter = (val: unknown, _column: number): string => {
    const numericType = typeof val === 'number' || typeof val === 'bigint';
    return numericType ? numFmt.format(val) : '';
  };

  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <TableToolbar
        cellWidth={cellWidth}
        setCellWidth={setCellWidth}
        displayStyle={displayStyle}
        updateDisplayStyle={setDisplayStyle}
        numberDigits={numberDigits}
        setNumberDigits={setNumberDigits}
      />
      <MatrixVis
        cellWidth={cellWidth ?? defaultWidth}
        dataArray={props.dataArray}
        formatter={matrixCellFormatter}
      />
    </div>
  );
}

export default TableDisplay;
export type { TableData };
