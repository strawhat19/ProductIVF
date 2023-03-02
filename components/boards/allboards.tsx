import { useEffect, useContext } from 'react';
import { StateContext } from '../../pages/_app';

export default function AllBoards() {
    const { allBoards, setAllBoards } = useContext<any>(StateContext);

    useEffect(() => {
        // console.log(`times check`);
    }, [])

    return (
        <section className={`boards allBoards`}>
            All Boards
            {allBoards && allBoards?.length && allBoards?.length > 0 && allBoards?.map((board, boardIndex) => {
                return (
                    <div className={`board flex row`} key={boardIndex}>
                        <span className={`mapIndex`}>{boardIndex + 1}</span>
                        <h3 className={`boardName`}>{board?.name}</h3>
                    </div>
                )
            })}
        </section>
    )
}