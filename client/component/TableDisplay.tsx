import '@h5web/lib/dist/styles.css';
import { MatrixVis } from '@h5web/lib';
import React from 'react';
import type { TypedArray, NdArray } from 'ndarray';

class TableDisplay extends React.Component<TableDisplayProps> {
  displayStyle = this.props.displayParams?.displayType ?? 'standard';
  numberDigits = this.props.displayParams?.numberDigits ?? 2;

  fmt =
    this.displayStyle === 'standard'
      ? new Intl.NumberFormat('en', {
          notation: 'standard',
          maximumFractionDigits: this.numberDigits,
        })
      : new Intl.NumberFormat('en', {
          notation: 'scientific',
          maximumSignificantDigits: this.numberDigits,
        });

  render() {
    const formatter = (val: unknown, _column: number): string => {
      return typeof val === 'number' || typeof val == 'bigint'
        ? this.fmt.format(val)
        : '';
    };
    return (
      <>
        <MatrixVis
          cellWidth={this.props.cellWidth}
          dataArray={this.props.dataArray as NdArray<TypedArray>}
          formatter={formatter}
        />
      </>
    );
  }
}

export default TableDisplay;
