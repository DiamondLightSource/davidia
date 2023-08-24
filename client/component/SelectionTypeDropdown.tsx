import { SelectionType } from './selections/utils';
import type { IconType } from 'react-icons/lib';
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
import styles from './SelectionTypeDropdown.module.css';

interface SelectionDropdownProps {
  value: SelectionType;
  onSelectionTypeChange: (selectionType: SelectionType) => void;
  disabled: boolean;
  options?: SelectionType[];
}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: IconType;
  label: string;
}

const SELECTION_OPTIONS: Record<SelectionType, SelectionTypeIcons> = {
  [SelectionType.line]: {
    Icon: BsSlashLg,
    label: 'Line',
  },
  [SelectionType.rectangle]: {
    Icon: MdOutlineRectangle,
    label: 'Rectangle',
  },
  [SelectionType.polyline]: {
    Icon: MdOutlinePolyline,
    label: 'Polyline',
  },
  [SelectionType.polygon]: {
    Icon: TbPolygon,
    label: 'Polygon',
  },
  [SelectionType.circle]: {
    Icon: TbCircle,
    label: 'Circle',
  },
  [SelectionType.ellipse]: {
    Icon: TbOvalVertical,
    label: 'Ellipse',
  },
  [SelectionType.sector]: {
    Icon: BiCircleQuarter,
    label: 'Sector',
  },
  [SelectionType.horizontalAxis]: {
    Icon: AiOutlineColumnWidth,
    label: 'Horizontal Axis',
  },
  [SelectionType.verticalAxis]: {
    Icon: AiOutlineColumnHeight,
    label: 'Vertical Axis',
  },
  [SelectionType.unknown]: {
    Icon: TbQuestionMark,
    label: 'Unknown',
  },
};

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
