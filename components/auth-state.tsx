import { useContext } from 'react';
import { StateContext } from '../pages/_app';
import { AuthStates } from '../shared/types/types';

export default function AuthState({ classes, nextOverride = ``, hideOnUsersLoading = false }: any) {
    let { user, authState, usersLoading } = useContext<any>(StateContext);
    return (
        hideOnUsersLoading == true && usersLoading ? <></> : (
            <span className={`${classes} textOverflow extended`} style={{minWidth: `fit-content`}}>
                {user != null ? (
                    `Welcome, ${user?.name}`
                ) : (nextOverride != `` && authState == AuthStates.Next) ? nextOverride : authState}
            </span>
        )
    )
}