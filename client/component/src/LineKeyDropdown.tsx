import Select, {
  CSSObjectWithLabel,
  GroupBase,
  OptionProps,
  StylesConfig,
} from 'react-select';
import type { LineParams } from './LinePlot';

/**
 * Represents line options.
 */
interface LineOption {
  /** The line option value */
  value: string;
  /** The line option label */
  label: string;
  /** The displayed background colour */
  bgcolour: string;
}

/**
 * Props for the `LineKeyDropdown` component.
 */
interface LineKeyDropdownProps {
  /** Map of line parameters */
  allLineParams: Map<string, LineParams>;
  /** The Key of the highlighted line */
  lineKey: string | null;
  /** Function that handles change in chosen line Key */
  onLineKeyChange: (s: string) => void;
  /** The lines from which to choose */
  options?: string[];
}

/**
 * Render a dropdown for choosing line.
 * @param {LineKeyDropdownProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function LineKeyDropdown(props: LineKeyDropdownProps) {
  const { allLineParams, lineKey, onLineKeyChange } = props;

  const options = [...allLineParams.keys()];

  /**
   * Set line key to first in list if not empty.
   */
  function initialiseLineKey() {
    if (lineKey === '' && options.length > 0) {
      onLineKeyChange(options[0]);
    }
  }

  initialiseLineKey();
  const defaultColour = '#ffffff';

  /**
   * Return line colour for a given line key.
   * @param {string} i - The line Key.
   * @returns {string | null} The line colour.
   */
  function getLineColour(k: string) {
    const lineParams = allLineParams.get(k);
    return lineParams?.colour ?? defaultColour;
  }

  /**
   * Return line colour for a given line key.
   * @param {string} i - The line Key.
   * @returns {string} The line name.
   */
  function getLineName(k: string): string {
    const lineParams = allLineParams.get(k);
    return lineParams?.name ?? 'Line';
  }

  function getLineLabelFromKey(key: string | null): string {
    const name = key ? getLineName(key) : '';
    return `\u2014 ${name}`;
  }

  const selectStyles: StylesConfig<
    LineOption,
    boolean,
    GroupBase<LineOption>
  > = {
    option: (
      base: CSSObjectWithLabel,
      props: OptionProps<LineOption, boolean, GroupBase<LineOption>>
    ) =>
      ({
        ...base,
        // eslint-disable-next-line react/prop-types
        backgroundColor: props.data.bgcolour,
      }) as CSSObjectWithLabel,
  };

  const optionsArr = options.map(
    (l) =>
      ({
        value: l,
        label: getLineLabelFromKey(l),
        bgcolour: getLineColour(l),
      }) as LineOption
  );

  return (
    <Select<LineOption>
      styles={selectStyles}
      value={
        {
          value: lineKey,
          label: getLineLabelFromKey(lineKey),
          bgcolour: getLineColour(lineKey ?? ''),
        } as LineOption
      }
      options={optionsArr}
      onMenuOpen={() => {
        if (!lineKey) {
          initialiseLineKey();
        }
      }}
      onChange={(selectedOption) => {
        if (selectedOption !== null) {
          onLineKeyChange(selectedOption.value);
        }
      }}
    />
  );
}

export default LineKeyDropdown;
export type { LineKeyDropdownProps };
