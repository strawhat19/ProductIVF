import Grid from './grid';
import { useContext, useEffect } from 'react';
import { db, gridsTable } from '../../firebase';
import { dev, StateContext } from '../../pages/_app';
import { collection, onSnapshot } from 'firebase/firestore';
import { Grid as GridModel } from '../../shared/models/Grid';

export default function Grids(props: any) {
    let { className = `gridsComponent` } = props;
    let { setUserGrids, setGridsLoading } = useContext<any>(StateContext);

    useEffect(() => {
        const gridsDatabase = collection(db, gridsTable);
        const gridsDatabaseRealtimeListener = onSnapshot(gridsDatabase, snapshot => {
            // setGridsLoading(true);
    
            let gridsFromDB = [];
            snapshot.forEach((doc) => gridsFromDB.push(new GridModel({ ...doc.data() })));
            gridsFromDB = gridsFromDB.sort((a, b) => a?.rank - b?.rank);
            setUserGrids(gridsFromDB);
    
            // setGridsLoading(false);
            dev() && console.log(`Grids Update from Database`, gridsFromDB);
        }, error => {
            console.log(`Error on Get Grids from Database`, error);
        })
    
        return () => {
            gridsDatabaseRealtimeListener();
        }
    }, [])

    return (
        <div className={`grids userGrids ${className}`}>
            <Grid />
        </div>
    )
}