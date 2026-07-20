import Modeless from './Modeless';
import { Fragment } from 'react';
import { HexColorPicker as Picker } from 'react-colorful';
import styles from './SelectionConfig.module.css';
import {
  type CustomDomain,
  type Domain,
  ToggleBtn,
  GlyphType,
} from '@h5web/lib';
import LabelledInput from './LabelledInput';
import type { IIconType } from './Modal';
import { isValidPointSize } from './utils';
import type { LineParams } from './LinePlot';
import GlyphTypeToggle from './GlyphTypeToggle';

/**
 * Props for the `LineConfig` component.
 */
interface LineConfigProps {
  /** The line parameters */
  allLineParams: Map<string, LineParams>;
  /** Handles updating parameters */
  updateLineParams: (key: string, params: LineParams) => void;
  /** The key of the current selection (optional) */
  currentLineKey: string | null;
  /** If the line config is shown */
  showLineConfig: boolean;
  /** Handles updating showLineConfig */
  updateShowLineConfig: (s: boolean) => void;
  /** If has control of the baton */
  hasBaton: boolean;
  /** The icon (optional) */
  icon?: IIconType;
  /** The label (optional) */
  label?: string;
  /** The data domain (optional) */
  domain?: Domain;
  /** The custom data domain (optional) */
  customDomain?: CustomDomain;
}

/**
 * Render the configuration options for a line.
 * @param {LineConfigProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function LineConfig(props: LineConfigProps) {
  const { currentLineKey, allLineParams, updateLineParams, hasBaton } = props;

  console.log('currentLineKey is ', currentLineKey);
  if (currentLineKey == null || !allLineParams.has(currentLineKey)) {
    return null;
  }

  const currentLineParams = allLineParams.get(currentLineKey);
  if (currentLineParams == undefined) {
    return null;
  }

  const colour = currentLineParams.colour ?? '#000000';

  return (
    <Modeless
      title={'Line'}
      showModeless={props.showLineConfig}
      setShowModeless={props.updateShowLineConfig}
    >
      <Fragment key="line colour">
        <div
          key="colour text"
          className={styles.colourLabel}
          style={{ borderLeftColor: colour }}
        >
          {colour}
        </div>
        <br key="colour spacer" />
        {hasBaton && (
          <Picker
            key="colour picker"
            color={colour}
            onChange={(c: string) => {
              if (c !== currentLineParams.colour) {
                updateLineParams(currentLineKey, {
                  ...currentLineParams,
                  colour: c,
                });
              }
            }}
          />
        )}
      </Fragment>
      <LabelledInput<string>
        key="colour input"
        label="colour"
        input={currentLineParams.colour ?? ''}
        updateValue={(c: string) => {
          if (c !== currentLineParams.colour) {
            updateLineParams(currentLineKey, {
              ...currentLineParams,
              colour: c,
            });
          }
        }}
        disabled={!hasBaton}
      />
      <LabelledInput<number>
        key="line width"
        label="line width"
        input={currentLineParams.width ?? 1}
        updateValue={(p: number) => {
          if (p !== currentLineParams.width && p >= 0) {
            updateLineParams(currentLineKey, {
              ...currentLineParams,
              width: p,
            });
          }
        }}
        isValid={(v) => isValidPointSize(v, currentLineParams.lineOn)}
        disabled={!hasBaton}
      />
      <LabelledInput<string>
        key="name"
        label="name"
        input={currentLineParams.name}
        updateValue={(n: string) => {
          if (n !== currentLineParams.name) {
            updateLineParams(currentLineKey, {
              ...currentLineParams,
              name: n,
            });
          }
        }}
        disabled={!hasBaton}
      />
      <ToggleBtn
        key="line on"
        label="Line on"
        value={currentLineParams.lineOn}
        onToggle={() => {
          if (currentLineParams.pointSize || !currentLineParams.lineOn) {
            updateLineParams(currentLineKey, {
              ...currentLineParams,
              lineOn: !currentLineParams.lineOn,
            });
          }
        }}
        disabled={
          !hasBaton ||
          currentLineParams.pointSize == undefined ||
          currentLineParams.pointSize == 0
        }
      />
      <GlyphTypeToggle
        key="glyph type"
        value={currentLineParams.glyphType ?? GlyphType.Circle}
        onGlyphTypeChange={(v: GlyphType) => {
          console.log('calling onGlyphTypeChange with cLine ', currentLineKey);
          if (v !== currentLineParams.glyphType) {
            updateLineParams(currentLineKey, {
              ...currentLineParams,
              glyphType: v,
            });
          }
        }}
        hasBaton={hasBaton}
      />
      <LabelledInput<number>
        key="point size"
        label="point size"
        input={currentLineParams.pointSize ?? 0}
        updateValue={(p: number) => {
          if (p !== currentLineParams.pointSize) {
            if (p == 0 && currentLineParams.lineOn) {
              updateLineParams(currentLineKey, {
                ...currentLineParams,
                pointSize: undefined,
              });
            } else if (p >= 0) {
              updateLineParams(currentLineKey, {
                ...currentLineParams,
                pointSize: p,
              });
            }
          }
        }}
        decimalPlaces={2}
        isValid={(v) => isValidPointSize(v, currentLineParams.lineOn)}
        disabled={!hasBaton}
      />
    </Modeless>
  );
}

export default LineConfig;
export type { LineConfigProps };
