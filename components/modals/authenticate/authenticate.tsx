import { useState } from 'react';
import { toast } from 'react-toastify';
import { dev } from '../../../pages/_app';
import { getIDParts } from '../../../shared/ID';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { renderFirebaseAuthErrorMessage } from '../../form';
import { maxAuthAttempts } from '../../../shared/constants';
import { auth, updateDocFieldsWTimeStamp } from '../../../firebase';

export default function Authenticate({ usr, actionLabel = `Delete User & All Data`, deleteUserFromDatabases }: any) {
    let [password, setPassword] = useState(``);

    const authenticateFormSubmit = (e?: any) => {
        if (e) e?.preventDefault();

        let email = usr?.email;
        dev() && console.log(`Authenticate Form Submit`, { email, password });

        signInWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
            if (userCredential != null) {
                let closeButton: any = document.querySelector(`.alertButton`);
                if (closeButton) {
                    closeButton.click();
                    deleteUserFromDatabases(usr);
                }
            }
        }).catch((error) => {
            const errorCode = error.code;
            const { date } = getIDParts();
            const errorMessage = error.message;
            const nextAttemptNum = usr?.auth?.attempts + 1;
            if (nextAttemptNum < maxAuthAttempts) {
                updateDocFieldsWTimeStamp(usr, { 'auth.attempts': nextAttemptNum, 'auth.lastAttempt': date });
            }
            if (errorMessage) {
                toast.error(renderFirebaseAuthErrorMessage(errorMessage) + `, Attempt #${usr?.auth?.attempts} / ${maxAuthAttempts}`);
                console.log(`Error Authenticating`, {
                    error,
                    errorCode,
                    errorMessage
                });
            }
            return;
        });
    }

    return (
        <div className={`authenticateFormContainer gridDetailView`}>
            <form className={`authenticateForm gridDetailViewForm flex isColumn`} onSubmit={(e) => authenticateFormSubmit(e)}>
                <div className={`authenticateFormField gridDetailFormField flex`}>
                    <span className={`formFieldLabel authenticateFormLabel gridNameLabel`} style={{ paddingRight: 15, minWidth: `max-content` }}>
                        Re-Enter Password to Confirm
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
                        disabled={usr?.auth?.attempts >= maxAuthAttempts}
                        className={`authenticateFormPasswordField gridNameField gridFormField ${usr?.auth?.attempts >= maxAuthAttempts ? `disabledField` : ``}`}
                    />
                </div>
                <button disabled={(usr?.auth?.attempts >= maxAuthAttempts)} className={`authenticateFormSubmitButton gridDetailViewFormSubmit gridFormField flex gap5 ${usr?.auth?.attempts >= maxAuthAttempts ? `disabledField` : `hoverBright`}`} type={`submit`}>
                    <i className={`modalFormButtonIcon fas fa-trash`} style={{ color: `red` }} />
                    Confirm {actionLabel}
                </button>
            </form>
        </div>
    )
}