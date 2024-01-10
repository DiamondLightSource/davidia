import { SelectionType } from './selections/utils';
import { AiOutlineColumnHeight, AiOutlineColumnWidth } from 'react-icons/ai';
import { BiCircleQuarter } from 'react-icons/bi';
import { BsSlashLg } from 'react-icons/bs';
import { MdOutlinePolyline, MdOutlineRectangle } from 'react-icons/md';
import {
  TbCircle,
  TbOvalVertical,
  TbPolygon,
  TbQuestionMark,
} from 'react-icons/tb';
import { Selector } from '@h5web/lib';

import type { IIconType } from './Modal';

import styles from './SelectionTypeDropdown.module.css';

interface SelectionDropdownProps {
  value: SelectionType;
  onSelectionTypeChange: (selectionType: SelectionType) => void;
  disabled: boolean;
  options?: SelectionType[];
}

/**
 *
 * Renders a dropdown for choosing selection type.
 * @param {SelectionDropdownProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function SelectionTypeDropdown(props: SelectionDropdownProps) {
  const {
    value,
    onSelectionTypeChange,
    options = [
      SelectionType.line,
      SelectionType.rectangle,
      SelectionType.horizontalAxis,
      SelectionType.verticalAxis,
      SelectionType.polygon,
      SelectionType.polyline,
    ],
  } = props;

  return (
    <Selector
      value={value}
      onChange={onSelectionTypeChange}
      options={options}
      optionComponent={SelectionTypeOption}
      disabled={props.disabled}
    />
  );
}

interface SelectionTypeIcons {
  Icon: IIconType;
  label: string;
}

const SELECTION_OPTIONS: Record<SelectionType, SelectionTypeIcons> = {
  [SelectionType.line]: {
    Icon: BsSlashLg as IIconType,
    label: 'Line',
  },
  [SelectionType.rectangle]: {
    Icon: MdOutlineRectangle as IIconType,
    label: 'Rectangle',
  },
  [SelectionType.polyline]: {
    Icon: MdOutlinePolyline as IIconType,
    label: 'Polyline',
  },
  [SelectionType.polygon]: {
    Icon: TbPolygon as IIconType,
    label: 'Polygon',
  },
  [SelectionType.circle]: {
    Icon: TbCircle as IIconType,
    label: 'Circle',
  },
  [SelectionType.ellipse]: {
    Icon: TbOvalVertical as IIconType,
    label: 'Ellipse',
  },
  [SelectionType.sector]: {
    Icon: BiCircleQuarter as IIconType,
    label: 'Sector',
  },
  [SelectionType.horizontalAxis]: {
    Icon: AiOutlineColumnWidth as IIconType,
    label: 'Horizontal Axis',
  },
  [SelectionType.verticalAxis]: {
    Icon: AiOutlineColumnHeight as IIconType,
    label: 'Vertical Axis',
  },
  [SelectionType.unknown]: {
    Icon: TbQuestionMark as IIconType,
    label: 'Unknown',
  },
};

/**
 *
 * Renders a selection icon.
 * @param {{ option: SelectionType }} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function SelectionTypeOption(props: { option: SelectionType }) {
  const { option } = props;
  const { Icon, label } = SELECTION_OPTIONS[option];

  return (
    <div className={styles.option}>
      <Icon className={styles.icon} />
      <span>{label}</span>
    </div>
  );
}

export default SelectionTypeDropdown;
export type { SelectionDropdownProps };
