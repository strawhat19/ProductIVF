import { useContext } from 'react';
import { StateContext } from '../pages/_app';
import { maxCredits } from '../shared/constants';
import { AuthStates } from '../shared/types/types';

export default function AuthState({ classes, nextOverride = ``, hideOnUsersLoading = false, extraUserMetric = `` }: any) {
    let { user, authState, usersLoading } = useContext<any>(StateContext);
    return (
        hideOnUsersLoading == true && usersLoading ? <></> : (
            <span className={`welcomeUser button authStateComponent ${user != null ? `hasUserSignedIn` : `noUserSignedIn`} ${classes} textOverflow extended`} style={{minWidth: `fit-content`}}>
                <i className={`userIcon fas fa-user`} style={{ fontSize: 16 }} />
                {user != null ? (
                    ((maxCredits - user?.properties) <= (maxCredits / 4)) ? (
                        `${user?.name} - Credits: ${(maxCredits - user?.properties)?.toLocaleString()}`
                    ) : `${user?.name} - ${user?.role}`
                ) : (nextOverride != `` && authState == AuthStates.Next) ? nextOverride : authState}
            </span>
        )
    )
}