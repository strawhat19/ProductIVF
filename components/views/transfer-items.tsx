import { transferTask } from '../../firebase';
import { StateContext } from '../../pages/_app';
import { logToast } from '../../shared/constants';
import { useContext, useEffect, useState } from 'react';
import { Statuses } from '../boards/details/detail-field';
import { Item as ItemModel } from '../../shared/models/Item';
import { toast } from 'react-toastify';

export default function TransferItems({ showIndexes = true }: any) {
    const { 
        selected,
        setSelected,
        globalUserData,
        setTransferOpen,
    } = useContext<any>(StateContext);

    const onCloseTransfer = () => {
        setTransferOpen(false);
        setSelected(null);
    }

    const onTransferTask = async (transferItem: ItemModel) => {
        let tsk = { ...selected?.task };
        let sourceItem: ItemModel = globalUserData?.items?.find(i => tsk?.itemID == i?.id);
        toast.info(`Transferring Task ${tsk?.name}`);
        onCloseTransfer();
        await transferTask(tsk, sourceItem, transferItem)?.then(() => {
            logToast(`Transferred Task ${tsk?.name}`, { task: tsk, transferItem, sourceItem });
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
                        let itemsTransferTo = itemsTransfer?.filter(i => i?.id != selected?.task?.itemID);
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
        <div className={`transferItemsContainer`}>
            {transferItems?.map((ti: ItemModel, tii) => (
                <div className={`transferItemElement`} key={tii}>    
                    <div className={`transferItemStart`} style={{ display: `flex`, alignItems: `center`, gridGap: 5 }}>
                        {showIndexes && <span>{tii + 1}.</span>}
                        <span>{ti?.name}</span>
                        <span>- "{ti?.board?.name}"</span>
                    </div>
                    <div className={`transferItemEnd`}>
                        <button className={`detailsCloseButton buttonComponent`} onClick={() => onTransferTask(ti)}>
                            <i className={`fas fa-exchange-alt mainColor`} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}