import { useContext } from 'react';
import { StateContext } from '../pages/_app';
import { AuthStates } from '../shared/types/types';

export default function AuthState({ classes, nextOverride = ``, hideOnUsersLoading = false, extraUserMetric = `` }: any) {
    let { user, authState, usersLoading } = useContext<any>(StateContext);
    return (
        hideOnUsersLoading == true && usersLoading ? <></> : (
            <span className={`authStateComponent ${user != null ? `hasUserSignedIn` : `noUserSignedIn`} ${classes} textOverflow extended`} style={{minWidth: `fit-content`}}>
                {user != null ? (
                    `Welcome, ${user?.name} - Credits: ${(20_000 - user?.properties)?.toLocaleString()}`
                ) : (nextOverride != `` && authState == AuthStates.Next) ? nextOverride : authState}
            </span>
        )
    )
}