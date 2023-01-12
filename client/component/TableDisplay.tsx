import '@h5web/lib/dist/styles.css';
import { MatrixVis } from '@h5web/lib';
import React from 'react';

class TableDisplay extends React.Component<TableDisplayProps> {
  displayStyle =
    this.props.displayParams !== undefined &&
    this.props.displayParams.displayType !== undefined
      ? this.props.displayParams.displayType
      : 'standard';

  numberDigits =
    this.props.displayParams !== undefined &&
    this.props.displayParams.numberDigits !== undefined
      ? this.props.displayParams.numberDigits
      : 2;

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
    const formatter = (val: any, colindex: number): string =>
      this.fmt.format(val);
    return (
      <>
        <MatrixVis
          cellWidth={this.props.cellWidth}
          dataArray={this.props.dataArray}
          formatter={formatter}
        />
      </>
    );
  }
}

export default TableDisplay;
