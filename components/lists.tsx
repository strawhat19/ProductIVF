import List from './list';
import { useContext } from 'react';
import { StateContext } from '../pages/_app';
export default function Lists(props) {
    const { lists } = useContext<any>(StateContext);
    return <section className={`lists`} id={`lists`}>
        {lists.sort((a,b) => b.items.length - a.items.length).map((list, index) => {
            return <List key={index + 1} list={list} id={`list-${index + 1}`} className={`list`} />
        })}
    </section>
}