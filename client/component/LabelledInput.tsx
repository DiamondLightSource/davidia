import '@h5web/lib/dist/styles.css';

import styles from './LabelledInput.module.css';

import { useState } from 'react';

interface LabelledInputProps<T> {
  updateValue: (value: T) => void;
  isValid?: (value: string) => [boolean, T];
  label: string;
  input: T;
  inputAttribs?: object;
  submitLabel?: string;
  disabled?: boolean;
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
  const [value, setValue] = useState<T>(props.input);
  const [newValue, setNewValue] = useState<string>(String(props.input));
  const noSubmitLabel = props.submitLabel === undefined;

  function handleInputChange(evt: React.ChangeEvent<HTMLInputElement>) {
    setIVState(InputValidationState.PENDING);
    const input = evt.currentTarget.value;
    console.log('Input change:', input);
    if (noSubmitLabel) {
      setNewValue(input);
      if (props.isValid !== undefined) {
        handleSubmit(input);
      } else {
        props.updateValue(input as T);
      }
    } else {
      setNewValue(input);
    }
  }

  function handleSubmit(input?: string) {
    if (props.isValid !== undefined) {
      const [isValid, validValue] = props.isValid(input ?? newValue);
      if (isValid) {
        setIVState(InputValidationState.VALID);
        props.updateValue(validValue);
        setValue(validValue);
      } else {
        setIVState(InputValidationState.ERROR);
      }
    }
  }

  const showOldValue =
    (noSubmitLabel && ivState === InputValidationState.ERROR) ||
    (!noSubmitLabel && ivState === InputValidationState.PENDING);

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
          onChange={handleInputChange}
          required
          value={showOldValue ? newValue : String(value)}
          disabled={props.disabled}
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
      </div>
    </>
  );
}
