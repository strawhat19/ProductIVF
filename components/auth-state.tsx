import { StateContext } from '../pages/_app';
import { useContext, useState } from 'react';
import { maxCredits } from '../shared/constants';
import { AuthStates } from '../shared/types/types';

export default function AuthState({ classes, nextOverride = ``, hideOnUsersLoading = false, asBtn = true }: any) {
    let [asButton, ] = useState(asBtn);
    let { user, authState, usersLoading } = useContext<any>(StateContext);
    return (
        hideOnUsersLoading == true && usersLoading ? <></> : (
            <span className={`welcomeUser flexLabel ${asButton ? `button` : ``} authStateComponent ${user != null ? `hasUserSignedIn` : `noUserSignedIn`} ${classes} textOverflow extended`} style={{ minWidth: `fit-content` }}>
                <a href={window.location.href?.includes(`/profile`) ? `/` : `/profile`} className={`welcomeUserProfileLink flexLabel`}>
                    <i className={`userIcon fas fa-user`} style={{ fontSize: 16, color: `var(--gameBlue)` }} />
                    {user != null ? (
                        ((maxCredits - user?.properties) <= (maxCredits / 4)) ? (
                            `${user?.name} - Credits: ${(maxCredits - user?.properties)?.toLocaleString()}`
                        ) : `${user?.name} - ${user?.role}`
                    ) : (nextOverride != `` && authState == AuthStates.Next) ? nextOverride : authState}
                </a>
            </span>
        )
    )
}