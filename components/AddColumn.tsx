import React, { useContext } from "react";
import { StateContext } from "../pages/_app";

function AddColumn(props) {

    const { lists } = useContext<any>(StateContext);

    const addNewColumn = (e) => {
        e.preventDefault();
        let formFields = e.target.children;

        const newColumnOrder = Array.from(props.state.columnOrder);
        const newColumnId = 'column-' + Math.floor(Math.random() * 100000);
        newColumnOrder.push(newColumnId);

        const newColumn = {
            id: newColumnId,
            title: formFields[0].value,
            taskIds: [],
        };

        props.setState({
            ...props.state,
            columnOrder: newColumnOrder,
            columns: {
                ...props.state.columns,
                [newColumnId]: newColumn
            }
        });

        e.target.reset();
    }

    return <div className="createList lists extended">
        <div id={props.id} className={`list items addListDiv`}>
            <div className="formItems items">
                <div className="addListFormItem">
                    <h2 style={{ fontWeight: 600, fontSize: 22, minWidth: `fit-content` }}>Create List {lists.length + 1}</h2>
                    <section className={`addListFormItemSection`} style={{ margin: 0 }}>
                        <form onSubmit={addNewColumn} title={`Add List`} id={`addListForm`} className={`flex addListForm itemButtons addForm`} style={{ width: `100%`, flexDirection: `row` }}>
                            <input maxLength={35} placeholder={`Name of List`} type="text" name="createItem" required />
                            <button type={`submit`} title={`Create List`} className={`iconButton createList`}>
                                <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-list"></i>
                                <span className={`iconButtonText textOverflow extended`}>
                                    <span style={{ fontSize: 12 }}>Create List</span><span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                                        {lists.length + 1}
                                    </span>
                                </span>
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    </div>
}

export default AddColumn;