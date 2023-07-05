import { HiCursorClick } from 'react-icons/hi';
import { Modal } from './Modal';
import { Btn } from '@h5web/lib';

export function BatonConfigModal(props: BatonProps) {
  return Modal({
    title: 'Selection baton config',
    icon: HiCursorClick,
    children: (
      <>
        <h5>Client uuid is {props.uuid}.</h5>
        {props.hasBaton && <h5> Has control of baton </h5>}
        {!props.hasBaton && <h5>Current baton holder is {props.batonUuid}.</h5>}
        <h5> Available uuids are {props.uuids} </h5>
        {!props.hasBaton && (
          <Btn
            label="Request baton"
            onClick={() => {
              props.requestBaton(props.uuid);
            }}
          ></Btn>
        )}
      </>
    ),
  });
}
