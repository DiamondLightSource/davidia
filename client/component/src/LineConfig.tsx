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
import type { DLineData } from './AnyPlot';
import { isValidPointSize } from './utils';
import GlyphTypeToggleProps from './GlyphTypeToggle';

/**
 * The props for the `LineConfig` component.
 * @interface {object} LineConfigProps
 * @member {string} title - The modal title.
 * @member {DLineData[]} lineData - The current lines.
 * @member {(l: DLineData) => void} updateLineParams - Handles updating selections.
 * @member {string | null} currentLineKey - The key of the current line.
 * @member {boolean} showLineConfig - If the selection config is shown.
 * @member {(s: boolean) => void} updateShowLineConfig - Handles updating showLineConfig.
 * @member {boolean} hasBaton - If has control of the baton.
 * @member {IIConType} [icon] - The icon.
 * @member {string} [label] - The label.
 * @member {Domain} [domain] - The data domain.
 * @member {CustomDomain} [customDomain] - The custom data domain.
 */
interface LineConfigProps {
  /** The modal title */
  title: string;
  /** The current selections */
  lineData: DLineData[];
  /** Handles updating selections */
  updateLineParams: (l: DLineData) => void;
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
 *
 * Renders the configuration options for a line.
 * @param {LineConfigProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function LineConfig(props: LineConfigProps) {
  const {
    currentLineKey,
    lineData,
    updateLineParams: updateLineParams,
    hasBaton,
  } = props;
  let currentLine: DLineData | null = null;
  if (lineData.length > 0) {
    currentLine = lineData.find((s) => s.key === currentLineKey) ?? lineData[0];
  }

  console.log('currentLineKey is ', currentLineKey);
  const modeless = [];
  if (currentLine !== null) {
    const cLine: DLineData = currentLine;
    console.log('cLine is ', cLine);
    const colour = (cLine.line_params.colour ??
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
              cLine.line_params.colour = c;
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
        input={cLine.line_params.colour ?? ''}
        updateValue={(c: string) => {
          cLine.line_params.colour = c;
          updateLineParams(cLine);
        }}
        disabled={!hasBaton}
      />
    );
    modeless.push(
      <LabelledInput<string>
        key="name"
        label="name"
        input={cLine.line_params.name}
        updateValue={(n: string) => {
          cLine.line_params.name = n;
          updateLineParams(cLine);
        }}
        disabled={!hasBaton}
      />
    );
    modeless.push(
      <ToggleBtn
        key="line on"
        label="Line on"
        value={cLine.line_params.line_on}
        onToggle={() => {
          if (cLine.line_params.point_size || !cLine.line_params.line_on) {
            cLine.line_params.line_on = !cLine.line_params.line_on;
            updateLineParams(cLine);
          }
        }}
        disabled={
          !hasBaton ||
          cLine.line_params.point_size == undefined ||
          cLine.line_params.point_size == 0
        }
      />
    );
    modeless.push(
      <GlyphTypeToggleProps
        key="glyph type"
        value={cLine.line_params.glyph_type as GlyphType}
        onGlyphTypeChange={(v: GlyphType) => {
          console.log('calling onGlyphTypeChange with cLine ', cLine);
          cLine.line_params.glyph_type = v;
          updateLineParams(cLine);
        }}
        hasBaton={hasBaton}
      />
    );
    modeless.push(
      <LabelledInput<number>
        key="point size"
        label="point size"
        input={cLine.line_params.point_size ?? 0}
        updateValue={(p: number) => {
          if (p == 0 && cLine.line_params.line_on) {
            cLine.line_params.point_size = undefined;
            updateLineParams(cLine);
          } else if (p >= 0) {
            cLine.line_params.point_size = p;
            updateLineParams(cLine);
          }
        }}
        decimalPlaces={2}
        isValid={(v) => isValidPointSize(v, cLine.line_params.line_on)}
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
