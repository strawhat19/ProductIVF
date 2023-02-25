import Board from './board';
import { useState, useEffect, useContext } from 'react';
import Boards, { BoardTypes, kanBanColumns } from './boards';
import { capitalizeAllWords, dev, formatDate, generateUniqueID, StateContext } from '../pages/_app';

export default function NewBoards() {
    const [boards, setBoards] = useState([]);
    const { setLoading, setSystemStatus, IDs, setIDs, devEnv } = useContext<any>(StateContext);

    const getBoardColumnsFromType = (boardType) => {
        switch (boardType) {
            default:
                return [];
            case BoardTypes.Kanban:
                return kanBanColumns;
        }
    }

    const addNewBoard = (e) => {
        e.preventDefault();
        setLoading(true);
        let formFields = e.target.children[0].children;
        let boardType = formFields.selectBoardType.value;
        let boardName = capitalizeAllWords(formFields.createBoard.value);
        // let boardsSection = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.nextSibling;

        if (boardType == BoardTypes.SelectBoardType) {
            boardType = BoardTypes.ToDo;
            if (boardName.includes(`Spread`)) boardType = BoardTypes.Spreadsheet;
            if (boardName.includes(`Sheet`)) boardType = BoardTypes.Spreadsheet;
            if (boardName.includes(`Tier`)) boardType = BoardTypes.TierList;
            if (boardName.includes(`Kan`)) boardType = BoardTypes.Kanban;
        }

        let newBoardID = `board_${boards.length + 1}_${generateUniqueID(IDs)}`;
        setSystemStatus(`Creating Board ${boardName}.`);

        let newBoard = {
            rows: [].concat(...getBoardColumnsFromType(boardType).map(col => col.rows)),
            columns: getBoardColumnsFromType(boardType),
            created: formatDate(new Date()),
            type: boardType,
            name: boardName,
            id: newBoardID,
        }

        if (dev()) {
            console.log(`addNewBoard Event`, e);
            // console.log(`addNewBoard type`, boardType);
            // console.log(`addNewBoard Boards`, boards);
        }

        setBoards([...boards, newBoard]);
        setIDs([...IDs, newBoard.id]);

        e.target.reset();
        // window.requestAnimationFrame(() => {
        //     return boardsSection.scrollTop = boardsSection.scrollHeight;
        // });
        setTimeout(() => {
            setLoading(false);
            setSystemStatus(`Created Board ${newBoard.name}.`);
        }, 1000);
    }

    useEffect(() => {
        if (dev()) {
            // console.log(`boards`, boards);
        }
    }, [boards]);

    return <>
        {devEnv && (
            <div className="createBoard lists extended">
                <div className={`list items addListDiv`}>
                    <div className="formItems items">
                        <div className="addListFormItem">
                            <h2 style={{ fontWeight: 600, fontSize: 22, minWidth: `fit-content` }}>Create Board {boards.length + 1}</h2>
                            <section className={`addBoardFormSection addListFormItemSection`} style={{ margin: 0 }}>
                                <form onSubmit={(e) => addNewBoard(e)} title={`Add Board`} id={`addBoardForm`} className={`addBoardForm flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
                                    <div className={`inputGroup flex row`}>
                                        <input maxLength={35} placeholder={`Name of Board`} type="text" name="createBoard" required />
                                        <select id={`select_board_type`} name={`selectBoardType`}>
                                            <option id={`board_option_default`} value={`Select Board Type`}>Select Board Type</option>
                                            {Object.values(BoardTypes).map(type => {
                                                return <option key={type} id={`board_option_${type}`} value={type}>{type}</option>
                                            })}
                                        </select>
                                    </div>
                                    <button type={`submit`} title={`Create Board`} className={`iconButton createList`}>
                                        <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-list"></i>
                                        <span className={`iconButtonText textOverflow extended`}>
                                            <span style={{ fontSize: 12 }}>Create Board</span><span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                                {boards.length + 1}
                                            </span>
                                        </span>
                                    </button>
                                </form>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        )}
        <Board />
    </>
}