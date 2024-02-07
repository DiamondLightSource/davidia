import { CellWidthInput, Separator, ToggleGroup, Toolbar } from '@h5web/lib';
import LabelledInput from '../small-components/LabelledInput';
import { isValidNumber } from '../utils';
import { TableDisplayType } from '..';
import { defaultWidth } from './tableConstants';

export function TableToolbar({
  cellWidth,
  setCellWidth,
  displayStyle,
  updateDisplayStyle,
  numberDigits,
  setNumberDigits,
}: {
  cellWidth: number;
  setCellWidth: (n: number) => void;
  displayStyle: TableDisplayType;
  updateDisplayStyle: (style: TableDisplayType) => void;
  numberDigits: number;
  setNumberDigits: (n: number) => void;
}) {
  const lowerBound = displayStyle === 'standard' ? 0 : 1;

  const upperBound = 10;

  const validateNumber = (v: string): [boolean, number] =>
    isValidNumber(v, lowerBound, upperBound);

  return (
    <Toolbar>
      <CellWidthInput
        key="cell width input"
        value={cellWidth}
        defaultValue={defaultWidth}
        onChange={(e) => {
          if (e) {
            setCellWidth(e);
          }
        }}
      />
      <Separator />
      <ToggleGroup
        key="display style toggle"
        role="radiogroup"
        ariaLabel="displayStyle"
        value={displayStyle as string}
        onChange={(e) => {
          if (e === 'scientific' || e === 'standard') {
            updateDisplayStyle(e as TableDisplayType);
          }
        }}
      >
        <ToggleGroup.Btn label="standard" value="standard" />
        <ToggleGroup.Btn label="scientific" value="scientific" />
      </ToggleGroup>
      <Separator />
      <LabelledInput<number>
        key="0"
        label="digits"
        input={numberDigits}
        isValid={validateNumber}
        inputAttribs={{
          name: 'digits',
          pattern: '^\\d$',
          size: 1,
        }}
        updateValue={setNumberDigits}
      />
      <Separator />
    </Toolbar>
  );
}
