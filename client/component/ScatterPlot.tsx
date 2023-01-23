import '@h5web/lib/dist/styles.css';
import { ScatterVis } from '@h5web/lib';

function ScatterPlot(props: ScatterPlotProps) {
  const abscissaValue: number[] =
    props.axesParameters.xValues === undefined
      ? Array.from(props.xData.data)
      : Array.from(props.axesParameters.xValues.data);
  const ordinateValue: number[] =
    props.axesParameters.yValues === undefined
      ? Array.from(props.yData.data)
      : Array.from(props.axesParameters.yValues.data);
  const colorMap = props.colorMap === undefined ? 'Viridis' : props.colorMap;
  return (
    <>
      <ScatterVis
        abscissaParams={{
          label: props.axesParameters.xLabel,
          value: abscissaValue,
          scaleType: props.axesParameters.xScale,
        }}
        colorMap={colorMap}
        title={props.axesParameters.title}
        dataArray={props.dataArray}
        domain={props.domain}
        ordinateParams={{
          label: props.axesParameters.yLabel,
          value: ordinateValue,
          scaleType: props.axesParameters.yScale,
        }}
        showGrid
      />
    </>
  );
}

export default ScatterPlot;
