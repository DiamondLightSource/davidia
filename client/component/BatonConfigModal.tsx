import { HiCursorClick } from 'react-icons/hi';
import { Modal } from './Modal';
import { Btn } from '@h5web/lib';
import { useMemo } from 'react';

export function BatonConfigModal(props: BatonProps) {
  const { batonUuid, uuid, others, hasBaton } = props;
  const oUuids = useMemo<string[]>(() => {
    return others.map((o) => (batonUuid == o ? o + '*' : o));
  }, [batonUuid, others]);
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
