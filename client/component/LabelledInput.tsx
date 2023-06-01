import '@h5web/lib/dist/styles.css';

import styles from './LabelledInput.module.css';

import { useRef, useState } from 'react';
import { IoMdUndo } from 'react-icons/io';

interface LabelledInputProps<T> {
  updateValue: (value: T) => void;
  isValid?: (value: string) => [boolean, T];
  label: string;
  input: T;
  inputAttribs?: object;
  submitLabel?: string;
  disabled?: boolean;
  enableEnterKey?: boolean;
  resetButton?: boolean;
}

enum InputValidationState {
  PENDING,
  ERROR,
  VALID,
}

export function LabelledInput<T>(props: LabelledInputProps<T>) {
  const [ivState, setIVState] = useState<InputValidationState>(
    InputValidationState.VALID
  );
  const [previousValue, setPreviousValue] = useState<T | null>(null);
  const [value, setValue] = useState<T>(props.input);
  const [unvalidatedValue, setUnvalidatedValue] = useState<string>(
    String(props.input)
  );
  const noSubmitLabel = props.submitLabel === undefined;
  const resetButton = props.resetButton !== false;
  const enableEnterKey = props.enableEnterKey !== false;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const liveUpdate = noSubmitLabel && !enableEnterKey;
  const showOldValue =
    (liveUpdate && ivState === InputValidationState.ERROR) ||
    (!liveUpdate && ivState === InputValidationState.PENDING) ||
    (noSubmitLabel && ivState === InputValidationState.ERROR) ||
    (!noSubmitLabel && ivState === InputValidationState.PENDING);

  function handleInputChange(evt: React.ChangeEvent<HTMLInputElement>) {
    setIVState(InputValidationState.PENDING);
    const input = evt.currentTarget.value;
    setUnvalidatedValue(input);
    if (liveUpdate) {
      handleSubmit(input);
    }
  }

  function handleSubmit(input?: string) {
    setIVState(InputValidationState.PENDING);
    if (props.isValid !== undefined) {
      const [isValid, validValue] = props.isValid(input ?? unvalidatedValue);
      if (isValid) {
        setIVState(InputValidationState.VALID);
        const preceedingValue = value;
        props.updateValue(validValue);
        setValue(validValue);
        setPreviousValue(preceedingValue);
      } else {
        setIVState(InputValidationState.ERROR);
      }
    } else {
      const typedInput = input as T;
      const preceedingValue = value;
      props.updateValue(typedInput);
      setValue(typedInput);
      setPreviousValue(preceedingValue);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (enableEnterKey && e.key === 'Enter') {
      handleSubmit(inputRef.current?.value);
    }
  };

  function handleReset() {
    setIVState(InputValidationState.PENDING);
    console.log('previous value is ', previousValue);
    if (previousValue !== null) {
      setIVState(InputValidationState.VALID);
      props.updateValue(previousValue);
      setValue(previousValue);
      console.log('setting value, ', previousValue);
    }
  }

  return (
    <>
      <div className={styles.top}>
        {ivState === InputValidationState.ERROR && (
          <div className={styles.error}>
            &quot;{unvalidatedValue}&quot; is invalid
          </div>
        )}
        <label className={styles.label} htmlFor="labelled-input">
          {props.label}:
        </label>
        <input
          id="labelled-input"
          ref={inputRef}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          required
          value={showOldValue ? unvalidatedValue : String(value)}
          disabled={props.disabled}
          onBlur={() => {
            handleSubmit(inputRef.current?.value);
          }}
          {...props.inputAttribs}
        />
        {!noSubmitLabel && (
          <button
            onClick={() => {
              handleSubmit(undefined);
            }}
            disabled={props.disabled}
          >
            {props.submitLabel}
          </button>
        )}
        {resetButton && (
          <button onClick={handleReset}>
            <IoMdUndo />
          </button>
        )}
      </div>
    </>
  );
}
