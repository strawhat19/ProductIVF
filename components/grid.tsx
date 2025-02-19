import { AgGridReact } from 'ag-grid-react';
import React, { useState, useContext } from 'react';

import { StateContext } from '../pages/_app';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Grid = ({columns, }) => {
    const { lists } = useContext<any>(StateContext);
  
    const [rowData] = useState(columns[0].items);

    const [columnDefs] = useState([{
        field: `content`, headerName: lists[0].name, 
        sortable: true, filter: true,
        // anim
    }, {field: `created`}, {field: `updated`}]);

    return (
        <div className="ag-theme-alpine-dark" style={{ background: `black`, color: `white`, width: `100%`, height: 400, padding: 15, margin: 15 }}>
            <AgGridReact animateRows={true} rowSelection={`multiple`} rowData={rowData} columnDefs={columnDefs}></AgGridReact>
        </div>
    );
};

export default Grid;