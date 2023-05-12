import '@h5web/lib/dist/styles.css';

import styles from './LabelledInput.module.css';

import { useRef, useState } from 'react';

interface LabelledInputProps<T> {
  updateValue: (value: T) => void;
  isValid?: (value: string) => [boolean, T];
  label: string;
  input: T;
  inputAttribs?: object;
  submitLabel?: string;
  disabled?: boolean;
  useEnter?: boolean;
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
  const [newValue, setNewValue] = useState<string>(String(props.input));
  const noSubmitLabel = props.submitLabel === undefined;
  const resetButton = props.resetButton != false;
  const useEnter = props.useEnter !== false;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const liveUpdate =
    props.submitLabel === undefined && props.useEnter === false;
  const showOldValue =
    (liveUpdate && ivState === InputValidationState.ERROR) ||
    (!liveUpdate && ivState === InputValidationState.PENDING) ||
    (noSubmitLabel && ivState === InputValidationState.ERROR) ||
    (!noSubmitLabel && ivState === InputValidationState.PENDING);

  function handleInputChange(evt: React.ChangeEvent<HTMLInputElement>) {
    setIVState(InputValidationState.PENDING);
    const input = evt.currentTarget.value;
    setNewValue(input);
    if (liveUpdate) {
      handleSubmit(input);
    }
  }

  function handleSubmit(input?: string) {
    setIVState(InputValidationState.PENDING);
    if (props.isValid !== undefined) {
      const [isValid, validValue] = props.isValid(input ?? newValue);
      if (isValid) {
        setIVState(InputValidationState.VALID);
        const previousValue = value;
        props.updateValue(validValue);
        setValue(validValue);
        setPreviousValue(previousValue);
      } else {
        setIVState(InputValidationState.ERROR);
      }
    } else {
      const typedInput = input as T;
      const previousValue = value;
      props.updateValue(typedInput);
      setValue(typedInput);
      setPreviousValue(previousValue);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (useEnter && e.key === 'Enter') {
      const current = inputRef.current?.value ?? undefined;
      handleSubmit(current);
    }
  };

  function handleReset() {
    setIVState(InputValidationState.PENDING);
    console.log('previous value is ', previousValue);
    if (previousValue != null) {
      if (props.isValid !== undefined) {
        const [isValid, validValue] = props.isValid(String(previousValue));
        if (isValid) {
          setIVState(InputValidationState.VALID);
          props.updateValue(validValue);
          setValue(previousValue);
          console.log('setting valid value, ', validValue);
        }
      } else {
        props.updateValue(previousValue);
        setValue(previousValue);
        console.log('setting typesInput, ', previousValue);
      }
    }
  }

  return (
    <>
      <div className={styles.top}>
        {ivState === InputValidationState.ERROR && (
          <div className={styles.error}>&quot;{newValue}&quot; is invalid</div>
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
          value={showOldValue ? newValue : String(value)}
          disabled={props.disabled}
          onBlur={() => {
            handleSubmit(inputRef.current.value);
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
          <button onClick={handleReset} disabled={previousValue == null}>
            {'Reset'}
          </button>
        )}
      </div>
    </>
  );
}
