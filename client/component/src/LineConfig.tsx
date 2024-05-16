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
import type { LineData } from './LinePlot';
import GlyphTypeToggleProps from './GlyphTypeToggle';

/**
 * Props for the `LineConfig` component.
 */
interface LineConfigProps {
  /** The modal title */
  title: string;
  /** The current selections */
  lineData: LineData[];
  /** Handles updating selections */
  updateLineParams: (d: LineData) => void;
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
 * @returns {React.JSX.Element} The rendered component.
 */
function LineConfig(props: LineConfigProps) {
  const {
    currentLineKey,
    lineData,
    updateLineParams: updateLineParams,
    hasBaton,
  } = props;
  let currentLine: LineData | null = null;
  if (lineData.length > 0) {
    currentLine = lineData.find((s) => s.key === currentLineKey) ?? lineData[0];
  }

  console.log('currentLineKey is ', currentLineKey);
  const modeless = [];
  if (currentLine !== null) {
    const cLine: LineData = currentLine;
    console.log('cLine is ', cLine);
    const colour = (cLine.lineParams.colour ??
      ('defaultColour' in cLine ? cLine.defaultColour : '#000000')) as string;

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
              cLine.lineParams.colour = c;
              updateLineParams(cLine);
            }}
          />
        )}
      </Fragment>
    );
    modeless.push(
      <LabelledInput<string>
        key="colour input"
        label="colour"
        input={cLine.lineParams.colour ?? ''}
        updateValue={(c: string) => {
          cLine.lineParams.colour = c;
          updateLineParams(cLine);
        }}
        disabled={!hasBaton}
      />
    );
    modeless.push(
      <LabelledInput<string>
        key="name"
        label="name"
        input={cLine.lineParams.name}
        updateValue={(n: string) => {
          cLine.lineParams.name = n;
          updateLineParams(cLine);
        }}
        disabled={!hasBaton}
      />
    );
    modeless.push(
      <ToggleBtn
        key="line on"
        label="Line on"
        value={cLine.lineParams.lineOn}
        onToggle={() => {
          if (cLine.lineParams.pointSize || !cLine.lineParams.lineOn) {
            cLine.lineParams.lineOn = !cLine.lineParams.lineOn;
            updateLineParams(cLine);
          }
        }}
        disabled={
          !hasBaton ||
          cLine.lineParams.pointSize == undefined ||
          cLine.lineParams.pointSize == 0
        }
      />
    );
    modeless.push(
      <GlyphTypeToggleProps
        key="glyph type"
        value={cLine.lineParams.glyphType as GlyphType}
        onGlyphTypeChange={(v: GlyphType) => {
          console.log('calling onGlyphTypeChange with cLine ', cLine);
          cLine.lineParams.glyphType = v;
          updateLineParams(cLine);
        }}
        hasBaton={hasBaton}
      />
    );
    modeless.push(
      <LabelledInput<number>
        key="point size"
        label="point size"
        input={cLine.lineParams.pointSize ?? 0}
        updateValue={(p: number) => {
          if (p == 0 && cLine.lineParams.lineOn) {
            cLine.lineParams.pointSize = undefined;
            updateLineParams(cLine);
          } else if (p >= 0) {
            cLine.lineParams.pointSize = p;
            updateLineParams(cLine);
          }
        }}
        decimalPlaces={2}
        isValid={(v) => isValidPointSize(v, cLine.lineParams.lineOn)}
        disabled={!hasBaton}
      />
    );
  }

  return Modeless({
    title: props.title,
    showModeless: props.showLineConfig,
    setShowModeless: props.updateShowLineConfig,
    children: modeless,
  });
}

export default LineConfig;
export type { LineConfigProps };
