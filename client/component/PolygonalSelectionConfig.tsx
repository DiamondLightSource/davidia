import PolygonalSelection from './selections/PolygonalSelection';
import { PointXInput, PointYInput } from './SelectionConfigComponents';

import styles from './PolygonalSelectionConfig.module.css';

interface PolygonalSelectionConfigProps {
  selection: PolygonalSelection;
  updateSelection: (s: SelectionBase | null, b?: boolean, c?: boolean) => void;
  disabled?: boolean;
}

export function PolygonalSelectionConfig(props: PolygonalSelectionConfigProps) {
  const { selection, updateSelection, disabled } = props;

  function updatePoint(p: [number, number], i: number) {
    selection.points[i] = p;
    updateSelection(selection);
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
