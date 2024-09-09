import { HiCursorClick } from 'react-icons/hi';
import type { IIconType } from './Modal';
import Modal from './Modal';
import { Btn } from '@h5web/lib';
import { useMemo } from 'react';
import type { BatonProps } from './models';

/**
 * Render the configuration options for the baton.
 * @export
 * @param {BatonProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export function BatonConfigModal(props: BatonProps) {
  const { batonUuid, uuid, others, hasBaton, offerBaton, requestBaton } = props;

  const batonTxt = batonUuid + '*';

  const keyItems = useMemo(() => {
    return hasBaton
      ? others.map((o) => (
          <div title="Pass baton on" key={o}>
            <Btn key={o} label={o} onClick={() => offerBaton(o)}></Btn>
          </div>
        ))
      : others.map((o) =>
          batonUuid == o ? (
            <div title="Request baton" key={batonUuid}>
              <Btn label={batonTxt} onClick={() => requestBaton()}></Btn>
            </div>
          ) : (
            <p key={o}>{o}</p>
          )
        );
  }, [batonTxt, batonUuid, hasBaton, offerBaton, others, requestBaton]);

  return Modal({
    title: 'Baton info',
    icon: HiCursorClick as IIconType,
    hideToggle: !uuid,
    children: (
      <div style={{ lineHeight: '80%', width: '10em' }}>
        <p>
          <strong>Client ({hasBaton ? batonTxt : uuid})</strong>
        </p>
        {!hasBaton && keyItems && (
          <>
            <p>Other client{keyItems.length > 1 ? 's' : ''}</p>
            {keyItems}
          </>
        )}
        {hasBaton && batonUuid && keyItems}
      </div>
    ),
  });
}
