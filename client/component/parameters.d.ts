type Aspect = import('@h5web/lib').Aspect;
type AxisScaleType = import('@h5web/lib').AxisScaleType;
type TableDisplayType = 'scientific' | 'standard';

interface TableDisplayParams {
  displayType?: TableDisplayType;
  numberDigits?: number;
}

interface AxesParameters {
  x_label?: string;
  y_label?: string;
  x_scale?: AxisScaleType;
  y_scale?: AxisScaleType;
  x_values?: MP_NDArray;
  y_values?: MP_NDArray;
  title?: string;
}
