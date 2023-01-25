import '@h5web/lib/dist/styles.css';
import { ScatterVis } from '@h5web/lib';

function ScatterPlot(props: ScatterPlotProps) {
  const abscissaValue: TypedArray =
    props.axesParameters.xValues?.data ?? props.xData.data;
  const ordinateValue: TypedArray =
    props.axesParameters.yValues?.data ?? props.yData.data;
  const colorMap = props.colorMap ?? 'Viridis';
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
