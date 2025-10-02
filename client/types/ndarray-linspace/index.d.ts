declare module 'ndarray-linspace' {
  import type { NdArray, TypedArray } from 'ndarray';
  type NDT = NdArray<TypedArray>;
  interface LinspaceOptions {
    endpoint?: boolean;
    axis?: number;
    dtype?: string;
  }
  export default function linspace(
    output: NDT,
    start: number,
    end: number,
    options?: LinspaceOptions
  ): NDT;
  export type { LinspaceOptions };
}
