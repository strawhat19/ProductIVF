import { useContext } from 'react';
import { Dialog } from '@mui/material';
import { toast } from 'react-toastify';
import { StateContext } from '../../../pages/_app';
import { logToast } from '../../../shared/constants';
import Authenticate, { onAuthenticate } from './authenticate';
import { deleteDatabaseData, deleteUserAuth } from '../../../firebase';

export default function AuthenticationDialog({ }: any) {
    const { user, signOutReset, onSignOut, onAuthenticateFunction, authenticateOpen, setAuthenticateOpen } = useContext<any>(StateContext);

    const deleteUserFromDatabases = async () => {
        toast.info(`Deleting User ${user?.id}`);
        signOutReset();
        await deleteDatabaseData(`ownerID`, `==`, user?.ownerID)?.then(async deletedDocIds => {
          await logToast(`Deleted ${user?.id} Data`, deletedDocIds, false);
          await deleteUserAuth(user).then(async eml => {
            await onSignOut();
          });
        })?.catch(async deleteUserDataError => {
          await logToast(`Delete User Data Error`, deleteUserDataError, true, deleteUserDataError);
        });
    }

    return (
        <Dialog
            open={authenticateOpen}
            onClose={(e) => setAuthenticateOpen(!authenticateOpen)}
            slotProps={{
                paper: {
                    component: `form`,
                    className: `authConfirmForm`,
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        const { password } = formJson;
                        // const switchGrid = () => {
                        //     setAuthenticateOpen(false);
                        //     switchSelectedGrid(user, upNextGrid);
                        //     // let usrGridURL = `/user/${user?.rank}/grids/${upNextGrid?.rank}`;
                        //     // router.replace(usrGridURL, undefined, {
                        //     //     shallow: true,
                        //     // });
                        // }
                        // const setGrid = () => {
                        //     setAuthenticateOpen(false);
                        //     setSelectedGrd(upNextGrid);
                        //     // let usrGridURL = `/user/${user?.rank}/grids/${upNextGrid?.rank}`;
                        //     // router.replace(usrGridURL, undefined, {
                        //     //     shallow: true,
                        //     // });
                        // }
                        const deleteAndCloseDialog = () => {
                            setAuthenticateOpen(false);
                            deleteUserFromDatabases();
                        }
                        if (onAuthenticateFunction == `Default`) {
                            onAuthenticate(user, password, deleteAndCloseDialog, event);
                        }
                    },
                },
            }}
        >
            <Authenticate />
        </Dialog>
    )
}