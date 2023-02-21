import { useContext, createContext } from 'react';
import type { ReactElement, ComponentType, SVGAttributes } from 'react';

import styles from './ToggleGroup.module.css';

interface ToggleGroupProps {
  role: 'tablist' | 'radiogroup';
  value: string;
  disabled?: boolean;
  onChange: (val: string) => void;
}

const ToggleGroupContext = createContext<ToggleGroupProps | undefined>(
  undefined
);

function useToggleGroupProps(): ToggleGroupProps {
  const context = useContext(ToggleGroupContext);

  if (!context) {
    throw new Error('Missing Toggle Group provider.');
  }

  return context;
}

interface BtnProps {
  label: string;
  value: string;
  icon?: ComponentType<SVGAttributes<SVGElement>>;
  iconOnly?: boolean;
  disabled?: boolean;
  position?: 'left' | 'middle' | 'right';
}

function Btn(props: BtnProps) {
  const {
    label,
    value,
    icon: Icon,
    iconOnly,
    disabled = false,
    position = 'left',
  } = props;
  const {
    role,
    value: selectedValue,
    disabled: isGroupDisabled,
    onChange,
  } = useToggleGroupProps();

  let btn_class: string;
  if (position === 'left') {
    btn_class = styles.btn + ' ' + styles.btn_left;
  } else if (position === 'right') {
    btn_class = styles.btn + ' ' + styles.btn_right;
  } else {
    btn_class = styles.btn + ' ' + styles.btn_middle;
  }

  return (
    <button
      disabled={disabled || isGroupDisabled}
      className={btn_class}
      type="button"
      title={iconOnly ? label : undefined}
      role={role === 'tablist' ? 'tab' : 'radio'}
      data-raised
      aria-label={iconOnly ? label : undefined}
      aria-checked={value === selectedValue}
      onClick={() => {
        onChange(value);
      }}
    >
      <span className={styles.btnLike}>
        {Icon && <Icon className={styles.icon} />}
        {!iconOnly && <span className={styles.label}>{label}</span>}
      </span>
    </button>
  );
}

interface Props extends ToggleGroupProps {
  ariaLabel?: string;
  children: ReactElement<BtnProps>[];
  id?: string;
}

export function ToggleGroup(props: Props) {
  const { role, ariaLabel, value, disabled, onChange, children, id } = props;

  return (
    <ToggleGroupContext.Provider value={{ role, value, disabled, onChange }}>
      <div className={styles.group} role={role} aria-label={ariaLabel} id={id}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

ToggleGroup.Btn = Btn;
