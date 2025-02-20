import { toast } from 'react-toastify';
import { useContext, useState } from 'react';
import { getIDParts } from '../../../shared/ID';
import { dev, StateContext } from '../../../pages/_app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { renderFirebaseAuthErrorMessage } from '../../form';
import { maxAuthAttempts } from '../../../shared/constants';
import { auth, updateDocFieldsWTimeStamp } from '../../../firebase';

export default function Authenticate({ attempts, actionLabel = `Delete User & All Data`, onAuthenticatedFunction }: any) {
    let [password, setPassword] = useState(``);
    let { user, globalUserData } = useContext<any>(StateContext);

    const authenticateFormSubmit = (e?: any) => {
        if (e) e?.preventDefault();

        let email = user?.email;

        if (password == ``) {
            toast.error(`Password Required`);
            return;
        } else {
            if (password?.length >= 6) {
            // signInWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
            //     if (userCredential != null) {
            //         let closeButton: any = document.querySelector(`.alertButton`);
            //         if (closeButton) {
            //             closeButton.click();
            //             onAuthenticatedFunction(user);
            //         }
            //     }
            // }).catch((error) => {
            //     const errorCode = error.code;
                const { date } = getIDParts();
            //     const errorMessage = error.message;
                const nextAttemptNum = user?.auth?.attempts + 1;
            //     if (nextAttemptNum < maxAuthAttempts) {
                    updateDocFieldsWTimeStamp(user, { 'auth.attempts': nextAttemptNum, 'auth.lastAttempt': date })?.then(() => {
                        dev() && console.log(`Authenticate Form Submit`, { user, globalUserData, attempts, email, password });
                    });
            //     }
            //     if (errorMessage) {
            //         toast.error(renderFirebaseAuthErrorMessage(errorMessage) + `, Attempt #${user?.auth?.attempts} / ${maxAuthAttempts}`);
            //         console.log(`Error Authenticating`, {
            //             error,
            //             errorCode,
            //             errorMessage
            //         });
            //     }
            //     return;
            // });
            } else {
                toast.error(`Password must be 6 characters or greater`);
                return;
            }
        }
    }

    return (
        <div className={`authenticateFormContainer gridDetailView`}>
            <form className={`authenticateForm gridDetailViewForm flex isColumn`} onSubmit={(e) => authenticateFormSubmit(e)}>
                <div className={`authenticateFormField gridDetailFormField flex`}>
                    <span className={`formFieldLabel authenticateFormLabel gridNameLabel`} style={{ paddingRight: 15, minWidth: `max-content` }}>
                        Re-Enter Password to Confirm {user?.auth?.attempts}
                    </span>
                    <input 
                        minLength={6} 
                        value={password}
                        type={`password`} 
                        name={`password`} 
                        autoComplete={`off`}
                        // onPaste={(e) => e?.preventDefault()}
                        placeholder={`Re-Enter Password to Confirm`}
                        onBlur={(e) => setPassword(e?.target?.value)} 
                        onChange={(e) => setPassword(e?.target?.value)} 
                        disabled={user?.auth?.attempts >= maxAuthAttempts}
                        className={`authenticateFormPasswordField gridNameField gridFormField ${user?.auth?.attempts >= maxAuthAttempts ? `disabledField` : ``}`}
                    />
                </div>
                <button disabled={((user?.auth?.attempts >= maxAuthAttempts) || password == ``)} className={`authenticateFormSubmitButton gridDetailViewFormSubmit gridFormField flex gap5 ${((user?.auth?.attempts >= maxAuthAttempts) || password == ``) ? `disabledField` : `hoverBright`}`} type={`submit`}>
                    <i className={`modalFormButtonIcon fas fa-trash`} style={{ color: `red` }} />
                    Confirm {actionLabel}
                </button>
            </form>
        </div>
    )
}