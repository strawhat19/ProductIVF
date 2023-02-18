import { AgGridReact } from 'ag-grid-react';
import React, { useState, useContext, useEffect } from 'react';

import { formatDate, StateContext } from '../pages/_app';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Grid = ({columns, rows}) => {
    const { lists, setLists, alertOpen, setAlertOpen, loading, setLoading, systemStatus, setSystemStatus, setAnimComplete, setPage, IDs, setIDs } = useContext<any>(StateContext);

    const [rowData] = useState([
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
    ]);
  
    // const [rowData] = useState(columns[0].items.map(itm => {
    //     return {
    //         ...itm,
    //         price: 2022,
    //         year: `2022`,
    //         make: `Lexus`,
    //         model: `IS 300`
    //     }
    // }));

    // const [rowData] = useState([
    //     { id: `item_1_9_21_PM_2_17_2023_68yscemwk`, content: `Corner Draggable`, complete: false, created: formatDate(new Date()) },
    //     { id: `item_2_9_22_PM_2_17_2023_r2epommeu`, content: `Switch to User`, complete: false, created: formatDate(new Date()) },
    // ].map(itm => {
    //     return {
    //         ...itm,
    //         price: 2022,
    //         year: `2022`,
    //         make: `Lexus`,
    //         model: `IS 300`
    //     }
    // }));

    const [columnDefs] = useState(columns.map(col => {
        return {
            ...col,
            field: col.name
        }
    }));

    // useEffect(() => {

    // }, [lists])

    return (
        <div className="ag-theme-alpine" style={{ background: `black`, color: `white`, width: `100%`, height: 400, padding: 15, margin: 15 }}>
            <AgGridReact rowData={rowData} columnDefs={columnDefs}></AgGridReact>
        </div>
    );
};

export default Grid;

// render(<Grid />, document.getElementById('root'));
