// import Transfer from './transfer';
import { Dialog } from '@mui/material';
import { useContext, useEffect } from 'react';
import { dev, StateContext } from '../../../pages/_app';

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

    useEffect(() => {
        if (selected) {
            dev() && console.log(`TransferDialog`, { selected });
        }
    }, [])

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
                    {/* <Transfer /> */}
                    {selected != null && (
                        <button className={`detailsCloseButton buttonComponent`} onClick={() => onCloseTransfer()}>
                            <i className={`fas fa-times`} />
                        </button>
                    )}
                    <span style={{ color: `white`, fontWeight: 700 }}>
                        Transfer Task "{selected?.task?.name}" from Item "{selected?.item?.name}" Coming Soon!
                    </span>
                </div>
            </div>
        </Dialog>
    )
}