import { SelectionType } from './selections/utils';
import { AiOutlineColumnHeight, AiOutlineColumnWidth } from 'react-icons/ai';
import { IoPieChartOutline } from "react-icons/io5";
import { BsSlashLg } from 'react-icons/bs';
import { MdOutlineShare } from "react-icons/md";
import { BiRectangle } from "react-icons/bi";
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
    Icon: BiRectangle as IIconType,
    label: 'Rectangle',
  },
  [SelectionType.polyline]: {
    Icon: MdOutlineShare as IIconType,
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
    Icon: IoPieChartOutline as IIconType,
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