import Details from './details';
import { useContext } from 'react';
import { Dialog } from '@mui/material';
// import { toast } from 'react-toastify';
import { isSelected } from '../../boards/column';
import { StateContext } from '../../../pages/_app';
import { Views } from '../../../shared/types/types';
// import { logToast } from '../../../shared/constants';
// import { AuthGrids } from '../../../shared/types/types';
// import { deleteDatabaseData, deleteUserAuth } from '../../../firebase';

export default function DetailsDialog({ }: any) {
    const { 
        selected,
        setSelected, 
    } = useContext<any>(StateContext);

    const onCloseLogic = (e?: any) => {
        setSelected(null);
    }

    return (
        <Dialog
            open={isSelected(selected, Views.Details)}
            onClose={(e) => onCloseLogic(e)}
            slotProps={{
                paper: {
                    component: `div`,
                    className: `detailsDialog`,
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                    },
                },
            }}
        >
            <div className={`detailsDialogAlert alert`}>
                <div className={`alertTitleRow`}>
                    <h2 className={`alertTitle`}>
                        {selected?.item?.name}
                    </h2>
                    <div className={`rightTitleField`}>
                        {selected != null && (
                            <button className={`detailsCloseButton buttonComponent`} onClick={(e) => onCloseLogic(e)}>
                                <i className={`fas fa-times`} />
                            </button>
                        )}
                    </div>
                </div>
                <div className={`detailsDialogAlertInner inner`}>
                    <Details />
                </div>
            </div>
        </Dialog>
    )
}