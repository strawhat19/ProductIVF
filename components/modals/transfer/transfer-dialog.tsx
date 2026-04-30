import { useContext } from 'react';
import { Dialog } from '@mui/material';
import { StateContext } from '../../../pages/_app';
import TransferItems from '../../views/transfer-items';

export default function TransferDialog({ }: any) {
    const { 
        selected,
        setSelected,
        transferOpen,
        setTransferOpen,
    } = useContext<any>(StateContext);

    const onCloseTransfer = () => {
        setTransferOpen(false);
        setSelected(null);
    }

    return (
        <Dialog
            open={transferOpen}
            slotProps={{
                paper: {
                    component: `div`,
                    className: `transferDialog`,
                    onSubmit: (event: any) => {
                        event.preventDefault();
                    },
                },
            }}
        >
            <div className={`transferDialogAlert alert`}>
                <div className={`transferDialogAlertInner inner`}>
                    <span style={{ color: `white`, fontWeight: 700 }}>
                        Transfer Task "{selected?.task?.name}" from Item "{selected?.item?.name}" in Column "{selected?.column?.name}" in Board "{selected?.board?.name}"
                    </span>
                    {selected != null && (
                        <button className={`detailsCloseButton buttonComponent`} onClick={() => onCloseTransfer()}>
                            <i className={`fas fa-times`} />
                        </button>
                    )}
                </div>
                <TransferItems />
            </div>
        </Dialog>
    )
}