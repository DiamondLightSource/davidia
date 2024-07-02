import type PolygonalSelection from './selections/PolygonalSelection';
import { PointXInput, PointYInput } from './SelectionConfigComponents';
import type { AddSelectionHandler } from './selections/utils';

import styles from './PolygonalSelectionConfig.module.css';

/**
 * Pops for the `PolygonalSelectionConfig` component.
 */
interface PolygonalSelectionConfigProps {
  /** The polygonal selection to configure */
  selection: PolygonalSelection;
  /** Handles update of selection */
  updateSelection?: AddSelectionHandler;
  /** If disabled */
  disabled?: boolean;
}

/**
 * Render configuration for polygonal selection.
 * @param {PolygonalSelectionConfigProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function PolygonalSelectionConfig(props: PolygonalSelectionConfigProps) {
  const { selection, updateSelection, disabled } = props;

  /**
   * Update a point.
   * @param {[number, number]} p - new coordinates for the point.
   * @param {number} i - index of point.
   */
  function updatePoint(p: [number, number], i: number) {
    selection.points[i] = p;
    if (updateSelection) {
      updateSelection(selection);
    }
  }

  const xyInputs = selection.points.map((p, i) => {
    return [
      <PointXInput
        key={`px${i}`}
        i={i}
        point={p}
        updatePoint={(np) => updatePoint(np, i)}
        disabled={disabled}
      />,
      <PointYInput
        key={`py${i}`}
        i={i}
        point={p}
        updatePoint={(np) => updatePoint(np, i)}
        disabled={disabled}
      />,
    ];
  });

  return (
    <div key="polygon" className={styles.scrollContainer}>
      {xyInputs.flat()}
    </div>
  );
}

export type { PolygonalSelectionConfigProps };
export default PolygonalSelectionConfig;
