import { useContext } from 'react';
import { StateContext } from '../pages/_app';

export default function AuthState({ classes }: any) {
    let { authState } = useContext<any>(StateContext);
    return (
        <span className={`${classes} textOverflow extended`} style={{minWidth: `fit-content`}}>
            {authState}
        </span>
    )
}