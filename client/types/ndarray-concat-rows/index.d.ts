declare module 'ndarray-concat-rows' {
  import type { NdArray, TypedArray } from 'ndarray';
  type NDT = NdArray<TypedArray>;
  export default function concatRows(a: NDT[]): NDT;
}
