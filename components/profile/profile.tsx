import Form from '../form';
import AuthState from '../auth-state';
import { useRouter } from 'next/router';
import { User } from '../../shared/models/User';
import { dev, StateContext } from '../../pages/_app';
import { stringMatch } from '../../shared/constants';
import { useContext, useEffect, useState } from 'react';

export default function Profile({ }) {
    let router = useRouter();
    let { id } = router.query;
    let { user, users } = useContext<any>(StateContext);

    let [originalQuery, setOriginalQuery] = useState(``);
    let [profile, setProfile] = useState<User | null>(user);
    let [profileLoading, setProfileLoading] = useState(true);

    const profileDataComponent = (profile: User) => {
        return <>
            <h2> - Rank: {profile?.rank}</h2>
            {/* <h2> - Friends: {profile?.data?.friendIDs?.length}</h2> */}
            <h2> - Role: {profile?.role}</h2>
            <h2> - Created: {profile?.meta?.created}</h2>
            <h2> - Email: {profile?.email}</h2>
            <br />
            <h2> - Boards: {profile?.boards?.length}</h2>
            {/* <h2> - Lists: {profile?.boards?.length}</h2>
            <h2> - Items: {profile?.boards?.length}</h2>
            <h2> - Tasks: {profile?.boards?.length}</h2> */}
        </>
    }

    useEffect(() => {
        if (id) {
            let quer = id?.toString();
            setOriginalQuery(quer);
            let query = quer?.toLowerCase();
            if (users.length > 0) {
                let userQuery = users.find((usr: User) => (
                    stringMatch(usr?.name, query) 
                    || stringMatch(usr?.id, query) 
                    || stringMatch(usr?.uid, query) 
                    || stringMatch(usr?.uuid, query) 
                    || stringMatch(usr?.title, query) 
                    || stringMatch(usr?.email, query) 
                    || stringMatch(usr?.rank?.toString(), query) 
                ))
                if (userQuery) {
                    const onFoundUser = () => {
                        setProfile(userQuery);
                        setProfileLoading(false);
                        console.log(`Found User for Query "${quer}"`, userQuery);
                    }
                    if (profile != null) {
                        if (stringMatch(profile?.id, userQuery?.id)) {
                            console.log(`User is Profile Query "${quer}"`);
                        } else onFoundUser();
                    } else onFoundUser();
                } else {
                    console.log(`Cannot Find User for Query "${quer}"`);
                    setProfileLoading(false);
                }
            }
        }
    }, [user, users])

    return <>
        <div className={`profileComponent`}>
            <div className={`profileHeader`}>
                {id ? <>
                    {profile != null ? <>
                        <h1>{profile?.name}</h1>
                    </> : <>
                        {profileLoading ? <>
                            <h1>Loading Profile "{id}"</h1>
                        </> : <>
                            <h1>Cannot Find Profile "{originalQuery}"</h1>
                        </>}
                    </>}
                </> : <>
                    {user != null ? <>
                        <AuthState />
                    </> : <>
                        <h1>Sign In to View your Profile</h1>
                    </>}
                </>}
            </div>
            <div className={`profileContent`} style={{ paddingTop: 15 }}>
                {id ? <>
                    {profile != null ? <>
                        {profileDataComponent(profile)}
                    </> : <>
                        {/* Empty */}
                    </>}
                </> : <>
                    <div className={`profileAuth`}>
                        {user != null ? <>
                            {dev() && <Form />}
                            <div style={{ paddingTop: dev() ? 30 : 0 }}>
                                {profileDataComponent(user)}
                            </div>
                        </> : <>
                            {/* Empty */}
                        </>}
                    </div>
                </>}
            </div>
        </div>
    </>
}