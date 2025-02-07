import { useContext } from 'react';
import { StateContext } from '../pages/_app';

export default function AuthState({ classes }: any) {
    let { user, authState } = useContext<any>(StateContext);
    return (
        <span className={`${classes} textOverflow extended`} style={{minWidth: `fit-content`}}>
            {user != null ? (
                `Welcome, ${user?.name}`
            ) : authState}
        </span>
    )
}