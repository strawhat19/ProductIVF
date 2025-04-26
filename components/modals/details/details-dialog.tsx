import Details from './details';
import { useContext } from 'react';
import { Dialog } from '@mui/material';
import { isSelected } from '../../boards/column';
import { StateContext } from '../../../pages/_app';
import { Views } from '../../../shared/types/types';
// import { Item } from '../../../shared/models/Item';
// import { Task } from '../../../shared/models/Task';
// import { updateDocFieldsWTimeStamp } from '../../../firebase';
// import ToggleButtons from '../../boards/details/toggle-buttons';
// import { forceFieldBlurOnPressEnter, removeExtraSpacesFromString } from '../../../shared/constants';

export default function DetailsDialog({ }: any) {
    const { 
        selected,
    } = useContext<any>(StateContext);

    return (
        <Dialog
            open={isSelected(selected, Views.Details)}
            slotProps={{
                paper: {
                    component: `div`,
                    className: `detailsDialog`,
                    onSubmit: (event: any) => {
                        event.preventDefault();
                    },
                },
            }}
        >
            <div className={`detailsDialogAlert alert`}>
                <div className={`detailsDialogAlertInner inner`}>
                    <Details />
                </div>
            </div>
        </Dialog>
    )
}