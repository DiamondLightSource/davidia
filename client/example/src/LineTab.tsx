import { LinePlot } from '@diamondlightsource/davidia';
import { linePropsNoSelection } from './plotData';
export function LineTab() {
  return (
    <div style={{ display: 'grid', height: '80vh' }}>
      <LinePlot {...linePropsNoSelection} updateSelection={null} />
    </div>
  );
}
