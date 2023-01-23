import '@h5web/lib/dist/styles.css';
import { MatrixVis } from '@h5web/lib';

function TableDisplay(props: TableDisplayProps) {
  const displayStyle = props.displayParams?.displayType ?? 'standard';
  const numberDigits = props.displayParams?.numberDigits ?? 2;

  const fmt =
    displayStyle === 'standard'
      ? new Intl.NumberFormat('en', {
          notation: 'standard',
          maximumFractionDigits: numberDigits,
        })
      : new Intl.NumberFormat('en', {
          notation: 'scientific',
          maximumSignificantDigits: numberDigits,
        });

  const formatter = (val: unknown, _column: number): string => {
    return typeof val === 'number' || typeof val == 'bigint'
      ? fmt.format(val)
      : '';
  };
  return (
    <>
      <MatrixVis
        cellWidth={props.cellWidth}
        dataArray={props.dataArray}
        formatter={formatter}
      />
    </>
  );
}

export default TableDisplay;
