import Form from '../form';
import AuthState from '../auth-state';
import { useRouter } from 'next/router';
import { User } from '../../shared/models/User';
import { dev, StateContext } from '../../pages/_app';
import { stringMatch } from '../../shared/constants';
import { useContext, useEffect, useState } from 'react';
import IVFSkeleton from '../loaders/skeleton/ivf_skeleton';

export default function Profile(props: any) {
    let router = useRouter();
    let { id } = router.query;
    let { user, users } = useContext<any>(StateContext);

    let [userIsQuery, setUserIsQuery] = useState(false);
    let [originalQuery, setOriginalQuery] = useState(``);
    let [profileLoading, setProfileLoading] = useState(true);
    let [profileToRender, setProfileToRender] = useState(user);

    const profileLoadingComponent = (label: string = `Profile Loading`) => {
        return (
            <IVFSkeleton 
                height={65} 
                label={label} 
                showLoading={true}
                className={`boardsSkeleton`} 
                style={{ margin: `5px 0`, '--animation-delay': `${0.15}s` }}
            />
        )
    }

    const profileDataComponent = (profileToShow: User) => {
        return <>
            <h2> - Rank: {profileToShow?.rank}</h2>
            <h2> - Role: {profileToShow?.role}</h2>
            <h2> - Created: {profileToShow?.meta?.created}</h2>
            <h2> - Email: {profileToShow?.email}</h2>
            <br />
            <h3> - Friends: {profileToShow?.data?.friendIDs?.length}</h3>
            <br />
            <h3> - Grids: {profileToShow?.data?.gridIDs?.length}</h3>
            <h3> - Boards: {profileToShow?.data?.boardIDs?.length}</h3>
            <h3> - Lists: {profileToShow?.data?.listIDs?.length}</h3>
            <h3> - Items: {profileToShow?.data?.itemIDs?.length}</h3>
            <h3> - Tasks: {profileToShow?.data?.taskIDs?.length}</h3>
        </>
    }

    useEffect(() => {
        if (id) {
            let quer = id?.toString();
            setOriginalQuery(quer);
            let query = quer?.toLowerCase();

            const onCantFindUser = () => {
                setUserIsQuery(false);
                setProfileLoading(false);
                console.log(`Cannot Find User for Query "${quer}"`);
            }

            if (users.length > 0) {
                let profQuery = users.find((prf: User) => (
                    stringMatch(prf?.name, query) 
                    || stringMatch(prf?.id, query) 
                    || stringMatch(prf?.ID, query) 
                    || stringMatch(prf?.uid, query) 
                    || stringMatch(prf?.uuid, query) 
                    || stringMatch(prf?.email, query) 
                    || stringMatch(prf?.rank?.toString(), query) 
                ))

                const onFoundUser = () => {
                    setProfileLoading(false);
                    setProfileToRender(profQuery);
                    console.log(`Found User for Query "${quer}"`, profQuery);
                }

                if (profQuery) {
                    if (user != null) {
                        if (stringMatch(user?.id, profQuery?.id)) {
                            setUserIsQuery(true);
                            console.log(`User is Profile Query "${quer}"`);
                        } else onFoundUser();
                    } else onFoundUser();
                } else onCantFindUser();
            } else onCantFindUser();
        } else {
            setProfileToRender(user);
        }
    }, [user, users])

    return <>
        <div className={`profileComponent`}>
            <div className={`profileHeader`}>
                {id ? <>
                    {profileToRender != null ? <>
                        <h1>{profileToRender?.name}</h1>
                    </> : <>
                        {profileLoading ? <>
                            {profileLoadingComponent(`Loading Profile "${id}"`)}
                        </> : <>
                            {profileLoadingComponent(`Cannot Find Profile "${originalQuery}"`)}
                        </>}
                    </>}
                </> : <>
                    {user != null ? <>
                        <AuthState />
                    </> : <>
                        {profileLoadingComponent(`Sign In To View Profile`)}
                    </>}
                </>}
            </div>
            <div className={`profileContent`} style={{ paddingTop: 15 }}>
                {(id && !userIsQuery) ? <>
                    {profileToRender != null ? <>
                        {profileDataComponent(profileToRender)}
                    </> : <>
                        {/* Empty */}
                    </>}
                </> : <>
                    <div className={`profileAuth`}>
                        {profileToRender != null ? <>
                            <div style={{ paddingBottom: dev() ? 30 : 0 }}>
                                {profileDataComponent(profileToRender)}
                            </div>
                            {dev() && user != null && <Form className={`profileForm`} />}
                        </> : <>
                            {/* Empty */}
                        </>}
                    </div>
                </>}
            </div>
        </div>
    </>
}