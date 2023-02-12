import '@h5web/lib/dist/styles.css';
import {
  ColorMapSelector,
  DomainSlider,
  GridToggler,
  SurfaceVis,
  ScaleSelector,
  Separator,
  Toolbar,
  getVisDomain,
} from '@h5web/lib';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';

function SurfacePlot(props: SurfacePlotProps) {
  const [colorMap, setColorMap] = useState<ColorMap>(
    props.colorMap ?? ('Warm' as ColorMap)
  );
  const [invertColorMap, toggleColorMapInversion] = useToggle();
  const [showPoints, togglePoints] = useToggle();
  const [customDomain, setCustomDomain] = useState<CustomDomain>([
    ...props.domain,
  ]);
  const [surfaceScaleType, setSurfaceScaleType] = useState<ScaleType>(
    props.surfaceScale
  );

  return (
    <>
      <Toolbar>
        <Separator />
        <ColorMapSelector
          value={colorMap}
          onValueChange={setColorMap}
          invert={invertColorMap}
          onInversionChange={toggleColorMapInversion}
        />
        <Separator />
        <DomainSlider
          dataDomain={props.domain}
          customDomain={customDomain}
          scaleType={surfaceScaleType}
          onCustomDomainChange={setCustomDomain}
        />
        <Separator />
        <ScaleSelector
          label="value"
          value={surfaceScaleType}
          onScaleChange={setSurfaceScaleType}
        />
        <Separator />
        <GridToggler value={showPoints} onToggle={togglePoints} />
        <Separator />
      </Toolbar>
      <SurfaceVis
        dataArray={props.values}
        domain={getVisDomain(customDomain, props.domain)}
        colorMap={colorMap}
        invertColorMap={invertColorMap}
        scaleType={surfaceScaleType}
        showPoints={showPoints}
      ></SurfaceVis>
    </>
  );
}

export default SurfacePlot;
