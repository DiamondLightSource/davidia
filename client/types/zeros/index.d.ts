declare module 'zeros' {
  import type { NdArray, TypedArray } from 'ndarray';
  type NDT = NdArray<TypedArray>;
  export default function zeros(shape: number[], dtype: string): NDT;
}
