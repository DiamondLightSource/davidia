declare module 'ndarray-tile' {
  import type { NdArray, TypedArray } from 'ndarray';
  type NDT = NdArray<TypedArray>;
  export default function tile(array: NDT, repeats: number[]): NDT;
}
