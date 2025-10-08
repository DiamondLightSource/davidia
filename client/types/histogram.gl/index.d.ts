declare module 'histogram.gl' {
  import type { TypedArray } from 'ndarray';
  export function createSingleChannelHistogram(
    d: TypedArray,
    w: number,
    h: number
  ): Promise<TypedArray>;
  export function createRgbaHistogram(
    d: TypedArray,
    w: number,
    h: number
  ): Promise<TypedArray>;
}
