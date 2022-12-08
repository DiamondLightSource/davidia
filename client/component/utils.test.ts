import { isHeatmapData } from './utils'

test('checks heatmap data', () => {
  const data = {key: '', values: null, domain: [4, 12], heatmap_scale: 'linear'};
  expect(isHeatmapData(data)).toBe(true);
});
