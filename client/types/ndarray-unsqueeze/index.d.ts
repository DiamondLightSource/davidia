declare module 'ndarray-unsqueeze' {
  import type { NdArray, TypedArray } from 'ndarray';
  type NDT = NdArray<TypedArray>;
  export default function unsqueeze(array: NDT, axis?: number): NDT;
}
