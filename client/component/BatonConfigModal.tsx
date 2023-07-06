import { HiCursorClick } from 'react-icons/hi';
import { Modal } from './Modal';
import { Btn } from '@h5web/lib';

export function BatonConfigModal(props: BatonProps) {
  const { batonUuid, uuid, others, hasBaton } = props;
  const oUuids = others.map((o) => (batonUuid == o ? o + '*' : o));
  return Modal({
    title: 'Baton',
    icon: HiCursorClick,
    children: (
      <div style={{ lineHeight: '80%' }}>
        <p>
          <strong>Client ({hasBaton ? uuid + '*' : uuid})</strong>
        </p>
        {oUuids.length > 0 && (
          <>
            <p>Other client{oUuids.length > 1 ? 's' : ''}</p>
            {oUuids.map((o) => (
              <p key={o}>{o}</p>
            ))}
          </>
        )}
        {!hasBaton && (
          <Btn label="Request baton" onClick={() => props.requestBaton()}></Btn>
        )}
      </div>
    ),
  });
}
