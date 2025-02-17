import { useContext, useState } from 'react';
import { StateContext } from '../pages/_app';

export default function AuthState({ classes, nextOverride = ``, hideOnEmailsLoading = false }: any) {
    let { user, emails, authState, emailsLoading } = useContext<any>(StateContext);

    let [profile, setProfile] = useState(user);

    const getMatchingEmailDoc = (email: string) => {
        if (email) {
            if (emails && emails.length > 0) {
                let matchingEmails = emails.filter(eml => eml?.email?.toLowerCase() == email?.toLowerCase());
                if (matchingEmails) {
                    let prof = matchingEmails[0];
                    // setProfile(prof);
                    return prof;
                }
            }
        }
    }

    return (
        hideOnEmailsLoading == true && emailsLoading ? <></> : (
            <span className={`${classes} textOverflow extended`} style={{minWidth: `fit-content`}}>
                {user != null ? (
                    `Welcome, ${getMatchingEmailDoc(user?.email)?.name}`
                ) : (nextOverride != `` && authState == `Next`) ? nextOverride : authState}
            </span>
        )
    )
}