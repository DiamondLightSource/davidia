import '@h5web/lib/dist/styles.css';
import { ColorMapSelector, DomainSlider, ScaleSelector } from '@h5web/lib';
import { LabelledInput } from './LabelledInput';
import { Modal } from './Modal';
import { createHistogramParams } from './utils';

export function AxisConfigModal(props: AxisConfigModalProps) {
  if (!props.show) {
    return null;
  }
  const label_input = props.label && props.setLabel && (
    <LabelledInput<string>
      key="2"
      label={'label'}
      input={props.label ?? ' '}
      updateValue={props.setLabel}
    />
  );

  const scale_selector = props.scaleType && props.setScaleType && (
    <ScaleSelector
      label={'scale'}
      value={props.scaleType}
      onScaleChange={props.setScaleType}
    />
  );

  const color_map_selector = props.colorMap &&
    props.setColorMap &&
    props.invertColorMap !== undefined &&
    props.toggleColorMapInversion !== undefined && (
      <ColorMapSelector
        value={props.colorMap}
        onValueChange={props.setColorMap}
        invert={props.invertColorMap}
        onInversionChange={props.toggleColorMapInversion}
      />
    );

  const domain_selector = props.domain &&
    props.customDomain &&
    props.scaleType &&
    props.setCustomDomain && (
      <div>
        <DomainSlider
          dataDomain={props.domain}
          customDomain={props.customDomain}
          scaleType={props.scaleType}
          onCustomDomainChange={props.setCustomDomain}
          histogram={createHistogramParams(props.values)}
          alwaysOpen={true}
        />
      </div>
    );

  return (
    <Modal title={props.title} show={props.show} onClose={props.onClose}>
      {label_input}
      {scale_selector}
      {color_map_selector}
      {domain_selector}
      {props.children}
    </Modal>
  );
}