import React, { useState } from "react";
// import "./Spreadsheet.css";

const Spreadsheet: React.FC<SpreadsheetProps> = ({ rows }) => {

    // console.log(rows);
    
    const [selectedCells, setSelectedCells] = useState<string[]>([]);
    const [draggedCells, setDraggedCells] = useState<string[]>([]);

    const handleCellClick = (event: React.MouseEvent<HTMLTableCellElement>) => {
        const cellId = event.currentTarget.dataset.cellId;
        if (!cellId) {
            return;
        }
        if (event.shiftKey && selectedCells.length > 0) {
            // Select all cells in the range from the first selected cell to this cell
            const firstCellId = selectedCells[0];
            const firstCell = document.querySelector(`[data-cell-id='${firstCellId}']`);
            const currentCell = document.querySelector(`[data-cell-id='${cellId}']`);
            if (!firstCell || !currentCell) {
                return;
            }
            const firstRow = parseInt(firstCell.getAttribute("data-row")!);
            const firstCol = parseInt(firstCell.getAttribute("data-col")!);
            const currentRow = parseInt(currentCell.getAttribute("data-row")!);
            const currentCol = parseInt(currentCell.getAttribute("data-col")!);
            const selected: string[] = [];
            for (let row = Math.min(firstRow, currentRow); row <= Math.max(firstRow, currentRow); row++) {
                for (let col = Math.min(firstCol, currentCol); col <= Math.max(firstCol, currentCol); col++) {
                    selected.push(`${row}-${col}`);
                }
            }
            setSelectedCells(selected);
        } else {
            setSelectedCells([cellId]);
        }
    };

    const handleCellMouseDown = (event: React.MouseEvent<HTMLTableCellElement>) => {
        const cellId = event.currentTarget.dataset.cellId;
        if (!cellId) {
            return;
        }
        setDraggedCells([cellId]);
    };

    const handleCellMouseOver = (event: React.MouseEvent<HTMLTableCellElement>) => {
        const cellId = event.currentTarget.dataset.cellId;
        if (!cellId) {
            return;
        }
        if (draggedCells.length > 0) {
            const firstCell = document.querySelector(`[data-cell-id='${draggedCells[0]}']`);
            if (!firstCell) {
                return;
            }
            const firstRow = parseInt(firstCell.getAttribute("data-row")!);
            const firstCol = parseInt(firstCell.getAttribute("data-col")!);
            const currentRow = parseInt(event.currentTarget.getAttribute("data-row")!);
            const currentCol = parseInt(event.currentTarget.getAttribute("data-col")!);
            const newSelected: string[] = [];
            for (let row = Math.min(firstRow, currentRow); row <= Math.max(firstRow, currentRow); row++) {
                for (let col = Math.min(firstCol, currentCol); col <= Math.max(firstCol, currentCol); col++) {
                    newSelected.push(`${row}-${col}`);
                }
            }
            setSelectedCells(newSelected);
        }
    };

    const handleCellMouseUp = (event: React.MouseEvent<HTMLTableCellElement>) => {
        setDraggedCells([]);
    };

    const handleRowDragStart = (event: React.DragEvent<HTMLTableRowElement>) => {
        const rowId = event.currentTarget.getAttribute("data-row-id");
        if (!rowId) {
            return;
        }
        // console.log(`handleRowDragStart`, event);
        (event.dataTransfer as DataTransfer).setData("text/plain", rowId);
        event.dataTransfer.effectAllowed = "move";
    };

    const handleRowDragOver = (event: React.DragEvent<HTMLTableRowElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    const handleRowDrop = (event: React.DragEvent<HTMLTableRowElement>) => {
        event.preventDefault();
        const sourceRowId = event.dataTransfer.getData("text/plain");
        const targetRowId = event.currentTarget.getAttribute("data-row-id");
        if (!sourceRowId || !targetRowId || sourceRowId === targetRowId) {
            return;
        }
        const sourceRow = rows[parseInt(sourceRowId)];
        const newRows = rows.filter((row, index) => index !== parseInt(sourceRowId));
        const targetIndex = parseInt(targetRowId);
        newRows.splice(targetIndex, 0, sourceRow);
        setSelectedCells([]);
        setDraggedCells([]);
    };

    const handleColDragStart = (event: React.DragEvent<HTMLTableHeaderCellElement>) => {
        const colId = event.currentTarget.getAttribute("data-col-id");
        if (!colId) {
            return;
        }
        // console.log(`handleColDragStart`, event);
        (event.dataTransfer as DataTransfer).setData("text/plain", colId);
        event.dataTransfer.effectAllowed = "move";
    };

    const handleColDragOver = (event: React.DragEvent<HTMLTableHeaderCellElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    const handleColDrop = (event: React.DragEvent<HTMLTableHeaderCellElement>) => {
        event.preventDefault();
        const sourceColId = event.dataTransfer.getData("text/plain");
        const targetColId = event.currentTarget.getAttribute("data-col-id");
        if (!sourceColId || !targetColId || sourceColId === targetColId) {
            return;
        }
        const newRows: Row[] = [];
        rows.forEach((row) => {
            const sourceColIndex = parseInt(sourceColId);
            const targetColIndex = parseInt(targetColId);
            const sourceCell = row.cells[sourceColIndex];
            const newCells = row.cells.filter((cell, index) => index !== sourceColIndex);
            newCells.splice(targetColIndex, 0, sourceCell);
            newRows.push({ cells: newCells });
        });
        setSelectedCells([]);
        setDraggedCells([]);
    };

    return (
        <table style={{margin: 15}} className="Spreadsheet">
            <thead>
                <tr>
                    {rows[0].cells.map((cell, index) => (
                        <th
                            key={index}
                            data-col-id={index}
                            draggable
                            onDragStart={handleColDragStart}
                            onDragOver={handleColDragOver}
                            onDrop={handleColDrop}
                        >
                            {String.fromCharCode(65 + index)}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, rowIndex) => (
                    <tr
                        key={rowIndex}
                        data-row-id={rowIndex}
                        draggable
                        onDragStart={handleRowDragStart}
                        onDragOver={handleRowDragOver}
                        onDrop={handleRowDrop}
                    >
                        <th>{rowIndex + 1}</th>
                        {row.cells.map((cell, colIndex) => (
                            <td
                                key={rowIndex - colIndex}
                                data-row={rowIndex}
                                data-col={colIndex}
                                data-cell-id={rowIndex - colIndex}
                                className={selectedCells.includes((`${ rowIndex } - ${ colIndex }`)) ? "selected" : ""}
                                onClick={handleCellClick}
                                onMouseDown={handleCellMouseDown}
                                onMouseOver={handleCellMouseOver}
                                onMouseUp={handleCellMouseUp}
                            >
                                {cell.value}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table >
    );
};

export default Spreadsheet;
