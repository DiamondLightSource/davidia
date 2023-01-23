import '@h5web/lib/dist/styles.css';
import { AxisParams, HeatmapVis } from '@h5web/lib';

function HeatmapPlot(props: HeatmapPlotProps) {
  const colorMap = props.colorMap ?? 'Warm';
  const aspect = props.aspect ?? 'auto';
  return (
    <>
      <HeatmapVis
        dataArray={props.values}
        domain={props.domain}
        colorMap={colorMap}
        scaleType={props.heatmapScale}
        aspect={aspect}
        showGrid
        title={props.axesParameters.title}
        abscissaParams={
          {
            label: props.axesParameters.xLabel,
            scaleType: props.axesParameters.xScale,
            value: props.axesParameters.xValues?.data,
          } as AxisParams
        }
        ordinateParams={
          {
            label: props.axesParameters.yLabel,
            scaleType: props.axesParameters.yScale,
            value: props.axesParameters.yValues?.data,
          } as AxisParams
        }
      ></HeatmapVis>
    </>
  );
}

export default HeatmapPlot;
