import '@h5web/lib/dist/styles.css';
import { Toolbar } from '@h5web/lib';
import PlotComponent from './PlotComponent';
import { useEffect, useState } from 'react';

interface PlotContainerProps {
  plots: string[];
  title: string;
}

export default function PlotContainer(props: PlotContainerProps) {
  const [selection, setSelection] = useState<Rect | undefined>(undefined);

  useEffect(() => {
    console.log(selection, '- has changed');
  }, [props, selection]);

  return (
    <>
      <h1>{props.title}</h1>
      <h2>Current selection is {selection}</h2>
      <Toolbar> </Toolbar>

      {props.plots.map(function (p, i) {
        return (
          <div key={i} style={{ display: 'grid', height: '40vh' }}>
            <PlotComponent
              plot_id={p}
              selection={selection}
              updateSelection={setSelection}
            />
          </div>
        );
      })}
    </>
  );
}
