import Grid from './grid';
import { useContext, useEffect } from 'react';
import { logToast } from '../../shared/constants';
import { dev, StateContext } from '../../pages/_app';
import { Grid as GridModel } from '../../shared/models/Grid';
import { Board as BoardModel } from '../../shared/models/Board';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { boardConverter, boardsTable, db, gridConverter, gridsTable } from '../../firebase';

export default function Grids(props: any) {
    let { className = `gridsComponent` } = props;
    let { user, setUserData, selectedGrids } = useContext<any>(StateContext);

    
    useEffect(() => {
        let gridsDatabaseRealtimeListener = null;
        let boardsDatabaseRealtimeListener = null;

        let id = ``;
        let lastSelectedGridID = ``;

        // id = `User_1_Test_UWD8cQIapTMMm4PwxjrE8tYiv4K2`;
        // lastSelectedGridID = `test@test.com_Grid_1_Personal_qmjuBaJI5_UWD8cQIapTMMm4PwxjrE8tYiv4K2`;

        if (user != null) {
            id = user?.id;
            lastSelectedGridID = user?.data?.selectedGridIDs[0];
        }

        if (user != null && id != `` && lastSelectedGridID != ``) {
            const gridsDatabase = collection(db, gridsTable)?.withConverter(gridConverter);
            const gridsQuery = query(gridsDatabase, where(`ownerID`, `==`, id));
            gridsDatabaseRealtimeListener = onSnapshot(gridsQuery, gridsSnapshot => {
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
                    logToast(`Error on Get Boards from Database`, error, true);
                })
            }, error => {
                logToast(`Error on Get Grids from Database`, error, true);
            })
        } else {
            if (gridsDatabaseRealtimeListener != null) gridsDatabaseRealtimeListener();
            if (boardsDatabaseRealtimeListener != null) boardsDatabaseRealtimeListener();
        }
    
        return () => {
            if (gridsDatabaseRealtimeListener != null) gridsDatabaseRealtimeListener();
            if (boardsDatabaseRealtimeListener != null) boardsDatabaseRealtimeListener();
        }

    }, [user])

    return (
        <div className={`grids userGrids ${className}`}>
            <Grid gridID={user != null ? user?.lastSelectedGridID : selectedGrids?.length > 0 ? selectedGrids[0]?.id : ``} />
            {/* {selectedGrids?.map((sgr, sgrIndex) => (
                <div key={sgrIndex} id={`selected_grid_${sgr?.id}`} className={`selectedGrid`}>
                    {sgr?.name} Grid
                    <div className={`gridsBoardsContainer`}>
                        {sgr?.data?.boardIDs?.length > 0 ? (
                            sgr?.data?.boardIDs?.map((brdID, brdIDIndex) => {
                                let thisGridBoard = userBoards?.find(bord => bord?.id == brdID);
                                if (thisGridBoard) {
                                    return (
                                        <div key={brdIDIndex}>
                                            Grid
                                            
                                        </div>
                                        // <Boards key={brdIDIndex} dbBoards={[thisGridBoard]} />
                                        // <div key={brdIDIndex} className={`gridBoard`}>
                                        //     {thisGridBoard?.name}
                                        // </div>
                                    )
                                }
                            })
                        ) : <></>}
                    </div>
                </div>
            ))} */}
        </div>
    )
}