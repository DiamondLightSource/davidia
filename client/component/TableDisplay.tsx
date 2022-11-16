import '@h5web/lib/dist/styles.css';
import { MatrixVis } from '@h5web/lib';
import React from 'react';



class TableDisplay extends React.Component<TableDisplayProps> {
  fmt = new Intl.NumberFormat('en', {notation: 'scientific', maximumSignificantDigits: 6});
  render() {
    const formatter = (val: any, colindex: number): string => this.fmt.format(val);
    return (
      <>
        <MatrixVis
          cellWidth={this.props.cellWidth}
          dataArray={this.props.dataArray}
          formatter= {formatter}
        />
      </>
    );
  }
}

export default TableDisplay;
