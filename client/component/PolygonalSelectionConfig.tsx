import PolygonalSelection from './selections/PolygonalSelection';
import { PointXInput, PointYInput } from './SelectionConfigComponents';
import { Fragment } from 'react';

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
        point={selection.points[i]}
        updatePoint={(p) => updatePoint(p, i)}
        disabled={disabled}
      />,
      <PointYInput
        key={`py${i}`}
        i={i}
        point={selection.points[i]}
        updatePoint={(p) => updatePoint(p, i)}
        disabled={disabled}
      />,
    ];
  });

  return <Fragment key="polygon">{xyInputs.flat()}</Fragment>;
}
