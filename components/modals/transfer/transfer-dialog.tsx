import { Dialog } from '@mui/material';
import { transferTask } from '../../../firebase';
import { StateContext } from '../../../pages/_app';
import { logToast } from '../../../shared/constants';
import { useContext, useEffect, useState } from 'react';
import { Statuses } from '../../boards/details/detail-field';
import { Item as ItemModel } from '../../../shared/models/Item';

export default function TransferDialog({ }: any) {
    const { 
        selected,
        setSelected,
        transferOpen,
        globalUserData,
        setTransferOpen,
    } = useContext<any>(StateContext);

    const onCloseTransfer = () => {
        setTransferOpen(false);
        setSelected(null);
    }

    const onTransferTask = async (transferItem: ItemModel) => {
        logToast(`Transferring`, transferItem);
        await transferTask(selected?.task, selected?.item, transferItem)?.then(() => {
            onCloseTransfer();
        });
    }

    const [transferItems, setTransferItems] = useState<ItemModel[]>([]);

    useEffect(() => {
        if (selected) {
            if (globalUserData) {
                if (globalUserData?.items && Array.isArray(globalUserData?.items)) {
                    if (globalUserData?.items?.length > 0) {
                        let boards = globalUserData?.boards;
                        let itemsTransfer = globalUserData?.items?.filter(i => i?.status != Statuses.Complete && i?.gridID == selected?.task?.gridID);
                        let itemsTransferTo = itemsTransfer?.filter(i => i?.id != selected?.item?.id);
                        let sortedItems = itemsTransferTo?.map(i => ({ ...i, board: boards?.find(b => b?.id == i?.boardID) }))?.sort((a, b) => {
                            let dateA = new Date(a.meta?.updated);
                            let dateB = new Date(b.meta?.updated);
                            return dateB.getTime() - dateA.getTime();
                        });
                        setTransferItems(sortedItems);
                    }
                }
            }
        }
    }, [selected, globalUserData]);

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
                <div className={`transferItemsContainer`}>
                    {transferItems?.map((ti, tii) => (
                        // <ItemWrapper key={tii} cursorGrab={false}>    
                        <div className={`transferItemElement`} key={tii}>    
                            <div className={`transferItemStart`} style={{ display: `flex`, alignItems: `center`, gridGap: 5 }}>
                                <span>{tii + 1}.</span>
                                <span>{ti?.name}</span>
                                <span>- "{ti?.board?.name}"</span>
                            </div>
                            <div className={`transferItemEnd`}>
                                <button className={`detailsCloseButton buttonComponent`} onClick={() => onTransferTask(ti)}>
                                    <i className={`fas fa-exchange-alt`} />
                                </button>
                            </div>
                            {/* <Item 
                                item={ti} 
                                itemIndex={tii} 
                                board={selected?.board} 
                                column={selected?.column} 
                            /> */}
                        {/* </ItemWrapper> */}
                        </div>
                    ))}
                </div>
            </div>
        </Dialog>
    )
}