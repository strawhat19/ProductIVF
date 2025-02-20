import { useState } from 'react';
import { capWords } from '../../pages/_app';
import { nameFields } from '../../shared/constants';
import { updateDocFieldsWTimeStamp } from '../../firebase';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

export default function GridDetailView({ selectedGrid }: any) {
    let [gridName, setGridName] = useState(selectedGrid?.name);
    let [gridNameLabel, setGridNameLabel] = useState(selectedGrid?.options?.nameLabel ? `Grid Name` : `Grid Title`);
    let [gridBoardsPosition, setGridBoardsPosition] = useState(selectedGrid?.options?.newestBoardsOnTop ? `Top` : `Bottom`);

    const changeGridBoardsPosition = (event: React.MouseEvent<HTMLElement>, newPosition: string) => {
        setGridBoardsPosition(newPosition);
    }

    const changeGridNameLabel = (event: React.MouseEvent<HTMLElement>, newNamePreference: string) => {
        setGridNameLabel(newNamePreference);
    }

    const gridDetailViewFormSubmit = (e?: any) => {
        if (e) e?.preventDefault();
        // let form = e?.target;
        // let formFields = form?.children;
        // let { gridNameField } = formFields;

        let updatedFormData = {
            name: gridName,
            nameLabel: gridNameLabel == `Grid Name`,
            newestBoardsOnTop: gridBoardsPosition == `Top`,
        };

        // dev() && console.log(`Grid Detail View Form Submit`, updatedFormData);

        // Update Grid Options
        updateDocFieldsWTimeStamp(selectedGrid, {
            ...(selectedGrid?.name?.toLowerCase() != gridName?.toLowerCase() && {
                A: updatedFormData?.name,
                name: updatedFormData?.name,
                title: `${selectedGrid?.type} ${selectedGrid?.rank} ${updatedFormData?.name}`,
            }),
            ...(selectedGrid?.options?.nameLabel != updatedFormData?.nameLabel && {
                'options.nameLabel': updatedFormData?.nameLabel,
            }),
            ...(selectedGrid?.options?.newestBoardsOnTop != updatedFormData?.newestBoardsOnTop && {
                'options.newestBoardsOnTop': updatedFormData?.newestBoardsOnTop,
            }),
        });

        let closeButton: any = document.querySelector(`.alertButton`);
        if (closeButton) closeButton.click();
    }

    return (
        <div className={`gridDetailView`}>
            <form className={`gridDetailViewForm flex isColumn`} onSubmit={(e) => gridDetailViewFormSubmit(e)}>
                <div className={`gridDetailFormField flex`}>
                    <span className={`formFieldLabel gridNameLabel`} style={{ paddingRight: 15, minWidth: `max-content` }}>
                        Grid Name
                    </span>
                    <input 
                        type={`text`} 
                        value={gridName} 
                        name={`gridNameField`} 
                        placeholder={`Enter Grid Name`}
                        minLength={nameFields?.grid?.min}
                        maxLength={nameFields?.grid?.max}
                        className={`gridNameField gridFormField`}
                        onChange={(e) => setGridName(e?.target?.value)} 
                        onBlur={(e) => setGridName(capWords(e?.target?.value))} 
                    />
                </div>
                <div className={`gridDetailFormField flex`}>
                    <span className={`formFieldLabel`}>
                        Grid Name as Label
                    </span>
                    <ToggleButtonGroup
                        exclusive
                        color={`primary`}
                        value={gridNameLabel}
                        aria-label={`gridNameLabel`}
                        onChange={changeGridNameLabel}
                    >
                        <ToggleButton value={`Grid Name`} className={`flex gap5`}>
                            <i className={`toggleButtonIcon fas fa-font`} style={{ color: `var(--gameBlue)` }} />
                            Grid Name
                        </ToggleButton>
                        <ToggleButton value={`Grid Title`} className={`flex gap5`}>
                            <i className={`toggleButtonIcon fas fa-text-height`} style={{ color: `var(--gameBlue)` }} />
                            Grid Title
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
                <div className={`gridDetailFormField flex`}>
                    <span className={`formFieldLabel`}>
                        Newest Boards on Top
                    </span>
                    <ToggleButtonGroup
                        exclusive
                        color={`primary`}
                        value={gridBoardsPosition}
                        aria-label={`gridBoardsPosition`}
                        onChange={changeGridBoardsPosition}
                    >
                        <ToggleButton value={`Top`} className={`flex gap5`}>
                            <i className={`toggleButtonIcon fas fa-sort-amount-up`} style={{ color: `var(--gameBlue)` }} />
                            On Top
                        </ToggleButton>
                        <ToggleButton value={`Bottom`} className={`flex gap5`}>
                            <i className={`toggleButtonIcon fas fa-sort-amount-down`} style={{ color: `var(--gameBlue)` }} />
                            On Bottom
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
                <button className={`gridDetailViewFormSubmit gridFormField hoverBright flex gap5`} type={`submit`}>
                    <i className={`modalFormButtonIcon fas fa-save`} style={{ color: `var(--grass)` }} />
                    Save
                </button>
            </form>
        </div>
    )
}