import { useContext, useEffect } from 'react';
import { dev, StateContext } from '../../pages/_app';
import { Grid as GridModel } from '../../shared/models/Grid';
import { Board as BoardModel } from '../../shared/models/Board';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { boardConverter, boardsTable, db, gridConverter, gridsTable } from '../../firebase';
import Board from '../boards/board';
import Boards from '../boards/boards';

export default function Grids(props: any) {
    let { className = `gridsComponent` } = props;
    let { user, userBoards, selectedGrids, setUserData } = useContext<any>(StateContext);

    useEffect(() => {
        if (user != null) {
            let boardsDatabaseRealtimeListener = null;
            let lastSelectedGridID = user?.data?.selectedGridIDs[0];
            const gridsDatabase = collection(db, gridsTable)?.withConverter(gridConverter);
            const gridsQuery = query(gridsDatabase, where(`ownerID`, `==`, user?.ID));
            const gridsDatabaseRealtimeListener = onSnapshot(gridsQuery, gridsSnapshot => {
                let gridsFromDB = [];
                gridsSnapshot.forEach((doc) => gridsFromDB.push(new GridModel({ ...doc.data() })));
                gridsFromDB = gridsFromDB.sort((a, b) => a?.rank - b?.rank);
                dev() && console.log(`Grids Update from Database`, gridsFromDB);

                const boardsDatabase = collection(db, boardsTable)?.withConverter(boardConverter);
                const boardsQuery = query(boardsDatabase, where(`gridID`, `==`, lastSelectedGridID));
                boardsDatabaseRealtimeListener = onSnapshot(boardsQuery, boardsSnapshot => {
                    let boardsFromDB = [];
                    boardsSnapshot.forEach((doc) => boardsFromDB.push(new BoardModel({ ...doc.data() })));
                    boardsFromDB = boardsFromDB.sort((a, b) => a?.rank - b?.rank);
                    dev() && console.log(`Boards Update from Database`, boardsFromDB);
                    setUserData(lastSelectedGridID, gridsFromDB, boardsFromDB);
                }, error => {
                    console.log(`Error on Get Boards from Database`, error);
                })

            }, error => {
                console.log(`Error on Get Grids from Database`, error);
            })
        
            return () => {
                gridsDatabaseRealtimeListener();
                if (boardsDatabaseRealtimeListener != null) boardsDatabaseRealtimeListener();
            }
        }
    }, [user])

    return (
        <div className={`grids userGrids ${className}`}>
            {/* <Grid /> */}
            {selectedGrids?.map((sgr, sgrIndex) => (
                <div key={sgrIndex} id={`selected_grid_${sgr?.ID}`} className={`selectedGrid`}>
                    {sgr?.name} Grid
                    <div className={`gridsBoardsContainer`}>
                        {sgr?.data?.boardIDs?.length > 0 ? (
                            sgr?.data?.boardIDs?.map((brdID, brdIDIndex) => {
                                let thisGridBoard = userBoards?.find(bord => bord?.ID == brdID);
                                if (thisGridBoard) {
                                    return (
                                        <Boards key={brdIDIndex} dbBoards={[thisGridBoard]} />
                                        // <div key={brdIDIndex} className={`gridBoard`}>
                                        //     {thisGridBoard?.name}
                                        // </div>
                                    )
                                }
                            })
                        ) : <></>}
                    </div>
                </div>
            ))}
        </div>
    )
}