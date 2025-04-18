import { useContext } from 'react';
import { Dialog } from '@mui/material';
import { toast } from 'react-toastify';
import { StateContext } from '../../../pages/_app';
import { logToast } from '../../../shared/constants';
import { AuthGrids } from '../../../shared/types/types';
import Authenticate, { onAuthenticate } from './authenticate';
import { deleteDatabaseData, deleteUserAuth } from '../../../firebase';

export default function AuthenticationDialog({ }: any) {
    const { 
        user,
        onSignOut,
        upNextGrid,
        signOutReset,
        globalUserData, 
        authenticateOpen, 
        setAuthenticateOpen,
        hardSetSelectedGrid,
        onAuthenticateFunction,
    } = useContext<any>(StateContext);

    const deleteAndCloseDialog = () => {
        setAuthenticateOpen(false);
        deleteUserFromDatabases();
    }
    const setAuthGrid = () => {
        setAuthenticateOpen(false);
        hardSetSelectedGrid(upNextGrid, globalUserData?.grids);
    }

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

    const onCloseLogic = (e?: any) => {
        setAuthenticateOpen(!authenticateOpen);
        if (onAuthenticateFunction == `Set Grid`) {
            const unAuthGrids = globalUserData?.grids?.filter(gr => !AuthGrids?.includes(gr?.gridType));
            hardSetSelectedGrid(unAuthGrids[0], globalUserData?.grids);
        }
    }

    return (
        <Dialog
            open={authenticateOpen}
            onClose={(e) => onCloseLogic(e)}
            slotProps={{
                paper: {
                    component: `form`,
                    className: `authConfirmForm`,
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        const { password } = formJson;
                        if (onAuthenticateFunction == `Default`) {
                            onAuthenticate(user, password, deleteAndCloseDialog, event);
                        } else if (onAuthenticateFunction == `Set Grid`) {
                            onAuthenticate(user, password, setAuthGrid, event);
                        }
                    },
                },
            }}
        >
            <Authenticate />
        </Dialog>
    )
}