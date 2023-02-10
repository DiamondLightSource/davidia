type Aspect = import('@h5web/lib').Aspect;
type ScaleType = import('@h5web/lib').ScaleType;
type TableDisplayType = 'scientific' | 'standard';

interface TableDisplayParams {
  displayType?: TableDisplayType;
  numberDigits?: number;
}

interface AxesParameters {
  x_label?: string;
  y_label?: string;
  x_scale?: ScaleType;
  y_scale?: ScaleType;
  x_values?: MP_NDArray;
  y_values?: MP_NDArray;
  title?: string;
}
