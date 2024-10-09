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
  const modeless = [];
  if (currentLineKey !== null && allLineParams.has(currentLineKey)) {
    const currentLineParams = allLineParams.get(currentLineKey);
    if (currentLineParams) {
      const colour = currentLineParams.colour ?? '#000000';

      modeless.push(
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
                currentLineParams.colour = c;
                updateLineParams(currentLineKey, currentLineParams);
              }}
            />
          )}
        </Fragment>
      );
      modeless.push(
        <LabelledInput<string>
          key="colour input"
          label="colour"
          input={currentLineParams.colour ?? ''}
          updateValue={(c: string) => {
            currentLineParams.colour = c;
            updateLineParams(currentLineKey, currentLineParams);
          }}
          disabled={!hasBaton}
        />
      );
      modeless.push(
        <LabelledInput<string>
          key="name"
          label="name"
          input={currentLineParams.name}
          updateValue={(n: string) => {
            currentLineParams.name = n;
            updateLineParams(currentLineKey, currentLineParams);
          }}
          disabled={!hasBaton}
        />
      );
      modeless.push(
        <ToggleBtn
          key="line on"
          label="Line on"
          value={currentLineParams.lineOn}
          onToggle={() => {
            if (currentLineParams.pointSize || !currentLineParams.lineOn) {
              currentLineParams.lineOn = !currentLineParams.lineOn;
              updateLineParams(currentLineKey, currentLineParams);
            }
          }}
          disabled={
            !hasBaton ||
            currentLineParams.pointSize == undefined ||
            currentLineParams.pointSize == 0
          }
        />
      );
      modeless.push(
        <GlyphTypeToggle
          key="glyph type"
          value={currentLineParams.glyphType}
          onGlyphTypeChange={(v: GlyphType) => {
            console.log(
              'calling onGlyphTypeChange with cLine ',
              currentLineKey
            );
            currentLineParams.glyphType = v;
            updateLineParams(currentLineKey, currentLineParams);
          }}
          hasBaton={hasBaton}
        />
      );
      modeless.push(
        <LabelledInput<number>
          key="point size"
          label="point size"
          input={currentLineParams.pointSize ?? 0}
          updateValue={(p: number) => {
            if (p == 0 && currentLineParams.lineOn) {
              currentLineParams.pointSize = undefined;
              updateLineParams(currentLineKey, currentLineParams);
            } else if (p >= 0) {
              currentLineParams.pointSize = p;
              updateLineParams(currentLineKey, currentLineParams);
            }
          }}
          decimalPlaces={2}
          isValid={(v) => isValidPointSize(v, currentLineParams.lineOn)}
          disabled={!hasBaton}
        />
      );
    }
  }

  return Modeless({
    title: 'Line',
    showModeless: props.showLineConfig,
    setShowModeless: props.updateShowLineConfig,
    children: modeless,
  });
}

export default LineConfig;
export type { LineConfigProps };
