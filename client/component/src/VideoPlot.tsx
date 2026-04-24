import {
  DefaultInteractions,
  type ModifierKey,
  ResetZoomButton,
  TooltipMesh,
  VisMesh,
  VisCanvas,
  getVisDomain,
  FloatingControl,
} from '@h5web/lib';
import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, useVideoTexture } from '@react-three/drei';

import SelectionComponent from './SelectionComponent';
import type { PlotBaseProps } from './models';
import { createInteractionsConfig, InteractionModeType } from './utils';
import {
  PlotCustomizationContextProvider,
  usePlotCustomizationContext,
} from './PlotCustomizationContext';
import { AnyToolbar } from './PlotToolbar';

/**
 * Props for the `VideoPlot` component.
 */
interface VideoPlotProps extends PlotBaseProps {
  /** video source url */
  sourceURL: string;
  /** if true, source is an animated image (MJPEG, animated GIF, etc) */
  isImage?: boolean;
}

function ImageMeshMaterial(props: {sourceUrl: string, play: boolean, setSize: (size: [number, number]) => void}) {
  const { setFrameloop } = useThree();
  const texture = useTexture(props.sourceUrl);
  const data = texture.source.data as HTMLImageElement;
  const height = data.height;
  const width = data.width;
  useEffect(() => {
    props.setSize([height, width]);
  }, [height, width]);

  useEffect(() => {
    return () => {
      setFrameloop('demand');
    };
  }, []);

  useEffect(() => {
    // dial down frame loop when no more frames
    if (data.complete) {
      setFrameloop('demand');
    }
  }, [data.complete]);

  useEffect(() => {
    setFrameloop(props.play ? 'always' : 'demand');
  }, [props.play]);
  useFrame(() => texture.needsUpdate = props.play);
  return <meshBasicMaterial map={texture} />;
}

function VideoMeshMaterial(props: {sourceUrl: string, play: boolean, setSize: (size: [number, number]) => void}) {
  const { setFrameloop } = useThree();
  const texture = useVideoTexture(props.sourceUrl);
  const data = texture.source.data;

  useEffect(() => {
    data.pause(); // start paused
    return () => {
      setFrameloop('demand');
    };
  }, []);

  const height = data.videoHeight;
  const width = data.videoWidth;
  useEffect(() => {
    props.setSize([height, width]);
  }, [height, width]);

  useEffect(() => {
    if (props.play) {
      data.play();
    } else {
      data.pause();
    }
    setFrameloop(props.play ? 'always' : 'demand');
  }, [props.play]);
  return <meshBasicMaterial map={texture} />;
}


function PlayButton(props: {clickPlay: () => void, text: string}) {
  return (
    <FloatingControl>
      <button
        type="button"
        onClick={() => props.clickPlay()}
      >
        <span>{props.text}</span>
      </button>
    </FloatingControl>
  );
}

export function VideoVisCanvas(props: VideoPlotProps) {
  const {
    title,
    showGrid,
    xCustomDomain,
    setXCustomDomain,
    xDomain,
    xLabel,
    yCustomDomain,
    setYCustomDomain,
    yDomain,
    yLabel,
    mode,
    batonProps,
    canSelect,
    selectionMax,
    selectionType,
    updateSelection,
    selections,
  } = usePlotCustomizationContext();
  const { sourceURL, isImage=false } = {...props};
  const [isPlaying, setPlaying] = useState(false);

  const interactionsConfig = createInteractionsConfig(mode);
  const tooltipText = (x: number, y: number): ReactElement<string> => {
    return (
      <p>
        {x.toPrecision(8)}, {y.toPrecision(8)}
      </p>
    );
  };

  const [size, setSize] = useState([1,1]);

  useEffect(() => {
    setXCustomDomain([0, size[1]]);
    setYCustomDomain([0, size[0]]);
  }, [size, setSize]);
  const xVisDomain = useMemo(() => {
    return getVisDomain(xCustomDomain, xDomain);
  }, [xCustomDomain, xDomain]);

  const yVisDomain = useMemo(() => {
    return getVisDomain(yCustomDomain, yDomain);
  }, [yCustomDomain, yDomain]);

  return (
    <VisCanvas
      title={title ?? ''}
      aspect={"equal"}
      abscissaConfig={{
        visDomain: xVisDomain,
        showGrid,
        isIndexAxis: true,
        label: xLabel,
        nice: true,
      }}
      ordinateConfig={{
        visDomain: yVisDomain,
        showGrid,
        isIndexAxis: true,
        label: yLabel,
        nice: true,
      }}
    >
      <DefaultInteractions {...interactionsConfig} />
      <ResetZoomButton />
      <PlayButton clickPlay={() => setPlaying((p) => !p)} text={isPlaying ? "Pause" : "Play"}/>
      <TooltipMesh renderTooltip={tooltipText} />
      <VisMesh>
        {isImage ? <ImageMeshMaterial sourceUrl={sourceURL} play={isPlaying} setSize={setSize} /> : <VideoMeshMaterial sourceUrl={sourceURL} play={isPlaying} setSize={setSize} />}
      </VisMesh>
      {canSelect && (
        <SelectionComponent
          modifierKey={[] as ModifierKey[]}
          batonProps={batonProps}
          disabled={mode !== InteractionModeType.selectRegion}
          selectionMax={selectionMax}
          selectionType={selectionType}
          updateSelection={updateSelection}
          selections={selections}
        />
      )}
    </VisCanvas>
  );
}

/**
 * Render a video plot.
 * @param {VideoPlotProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function VideoPlot(props: VideoPlotProps) {
  return (
    <div
      style={{
        display: 'grid',
        position: 'relative',
      }}
    >
      <PlotCustomizationContextProvider {...props}>
        <AnyToolbar>{props.customToolbarChildren}</AnyToolbar>
        <VideoVisCanvas {...props} />
      </PlotCustomizationContextProvider>
    </div>
  );
}

export default VideoPlot;
export type { VideoPlotProps };
