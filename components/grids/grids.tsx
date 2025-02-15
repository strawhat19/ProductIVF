import Grid from './grid';
import { useContext, useEffect } from 'react';
import { Board } from '../../shared/models/Board';
import { dev, StateContext } from '../../pages/_app';
import { Grid as GridModel } from '../../shared/models/Grid';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { boardConverter, boardsTable, db, gridConverter, gridsTable } from '../../firebase';

export default function Grids(props: any) {
    let { className = `gridsComponent` } = props;
    let { user, setUserData } = useContext<any>(StateContext);

    useEffect(() => {
        if (user != null) {
            let gridsFromDB = [];
            let boardsDatabaseRealtimeListener = null;
            let lastSelectedGridID = user?.data?.selectedGridIDs[0];
            const gridsDatabase = collection(db, gridsTable)?.withConverter(gridConverter);
            const gridsQuery = query(gridsDatabase, where(`ownerID`, `==`, user?.ID));
            const gridsDatabaseRealtimeListener = onSnapshot(gridsQuery, gridsSnapshot => {
                gridsSnapshot.forEach((doc) => gridsFromDB.push(new GridModel({ ...doc.data() })));
                gridsFromDB = gridsFromDB.sort((a, b) => a?.rank - b?.rank);
                dev() && console.log(`Grids Update from Database`, gridsFromDB);

                let boardsFromDB = [];
                const boardsDatabase = collection(db, boardsTable)?.withConverter(boardConverter);
                const boardsQuery = query(boardsDatabase, where(`gridID`, `==`, lastSelectedGridID));
                boardsDatabaseRealtimeListener = onSnapshot(boardsQuery, boardsSnapshot => {
                    boardsSnapshot.forEach((doc) => boardsFromDB.push(new Board({ ...doc.data() })));
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
            <Grid />
        </div>
    )
}