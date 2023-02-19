import React, { useState } from 'react';

function AddTask(props) {
    // const [showNewTaskButton, setShowNewTaskButton] = useState(true);
    // const [value, setValue] = useState("");

    // function onNewTaskButtonClick() {
    //     setShowNewTaskButton(false);
    // }

    // function handleInputChange(event) {
    //     setValue(event.target.value);
    // }

    // function onNewTaskInputComplete() {
    //     setShowNewTaskButton(true);
    //     addNewTask(props.columnId, value);
    //     setValue("");
    // }

    const addNewTask = (e) => {
        e.preventDefault();
        let formFields = e.target.children;
        const newTaskId = 'task-' + Math.floor(Math.random() * 100000);

        const column = props.state.columns[props.columnId];
        const newTaskIds = Array.from(column.taskIds);
        newTaskIds.push(newTaskId);

        const newTask = {
            id: newTaskId,
            content: formFields[0].value,
        }

        props.setState({
            ...props.state,
            tasks: {
                ...props.state.tasks,
                [newTaskId]: newTask
            },
            columns: {
                ...props.state.columns,
                [props.columnId]: {
                    ...props.state.columns[props.columnId],
                    taskIds: newTaskIds
                }
            }
        });

        e.target.reset();
    }

    return (
        <div>
            <form title={`Add Item`} id={`add_item_form_${props.columnId}`} className={`flex addItemForm itemButtons unset addForm`} style={{ width: `100%`, flexDirection: `row` }} onSubmit={(e) => addNewTask(e)}>
                {/* <div className="itemOrder" style={{maxWidth: `fit-content`, height: `100%`}}>
                        <i style={{color: `var(--gameBlue)`, fontSize: 12, padding: `0 15px`, maxWidth: `fit-content`, height: `100%`, background: `white`}} className="fas fa-plus"></i>
                    </div> */}
                <input placeholder={`Name of Item`} type="text" name="createItem" required />
                <button type={`submit`} title={`Add Item`} className={`iconButton createList wordIconButton`}>
                    <i style={{ color: `var(--gameBlue)`, fontSize: 13 }} className="fas fa-plus"></i>
                    <span className={`iconButtonText textOverflow extended`}>
                        <span style={{ fontSize: 12 }}>Add</span>
                        <span className={`itemLength index`} style={{ fontSize: 14, fontWeight: 700, padding: `0 5px`, color: `var(--gameBlue)`, maxWidth: `fit-content` }}>
                            {/* {list.items.length + 1} */}
                        </span>
                    </span>
                </button>
                {/* <input style={{width: `35%`}} className={`save submit`} type="submit" value={`Add Item`} /> */}
            </form>
            {/* {
                showNewTaskButton ?
                    <button onClick={onNewTaskButtonClick}>New</button> :
                    <input type="text" value={value} onChange={handleInputChange} onBlur={onNewTaskInputComplete} />
            } */}
        </div>
    )
}

export default AddTask;