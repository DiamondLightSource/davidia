import '@h5web/lib/dist/styles.css';
import { AxisParams, RgbVis } from '@h5web/lib';

function ImagePlot(props: ImagePlotProps) {
  const aspect = props.aspect ?? 'equal';
  return (
    <>
      <RgbVis
        dataArray={props.values}
        aspect={aspect}
        showGrid
        title={props.axesParameters.title}
        abscissaParams={
          {
            label: props.axesParameters.xLabel,
            value: props.axesParameters.xValues?.data,
          } as AxisParams
        }
        ordinateParams={
          {
            label: props.axesParameters.yLabel,
            value: props.axesParameters.yValues?.data,
          } as AxisParams
        }
      ></RgbVis>
    </>
  );
}

export default ImagePlot;
