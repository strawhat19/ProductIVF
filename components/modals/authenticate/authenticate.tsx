import { useState } from 'react';
import { toast } from 'react-toastify';
import { auth } from '../../../firebase';
import { dev } from '../../../pages/_app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { renderFirebaseAuthErrorMessage } from '../../form';

export default function Authenticate({ usr, actionLabel = `Delete User & All Data`, attempts, maxAttempts, setAttempts, deleteUserFromDatabases }: any) {
    let [password, setPassword] = useState(``);
    let [authenticated, setAuthenticated] = useState(false);

    const authenticateFormSubmit = (e?: any) => {
        if (e) e?.preventDefault();

        let email = usr?.email;
        setAttempts(prevAttempts => prevAttempts + 1);
        dev() && console.log(`Authenticate Form Submit`, { email, password });

        signInWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
            if (userCredential != null) {
                setAuthenticated(true);
                let closeButton: any = document.querySelector(`.alertButton`);
                if (closeButton) {
                    closeButton.click();
                    deleteUserFromDatabases(usr);
                }
            }
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorMessage) {
                toast.error(renderFirebaseAuthErrorMessage(errorMessage) + `, Attempt #${attempts + 1} / ${maxAttempts}`);
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
                        disabled={attempts >= maxAttempts}
                        // onPaste={(e) => e?.preventDefault()}
                        placeholder={`Re-Enter Password to Confirm`}
                        onBlur={(e) => setPassword(e?.target?.value)} 
                        onChange={(e) => setPassword(e?.target?.value)} 
                        className={`authenticateFormPasswordField gridNameField gridFormField ${attempts >= maxAttempts ? `disabledField` : ``}`}
                    />
                </div>
                <button disabled={(attempts >= maxAttempts)} className={`authenticateFormSubmitButton gridDetailViewFormSubmit gridFormField flex gap5 ${attempts >= maxAttempts ? `disabledField` : `hoverBright`}`} type={`submit`}>
                    <i className={`modalFormButtonIcon fas fa-trash`} style={{ color: `red` }} />
                    Confirm {actionLabel}
                </button>
            </form>
        </div>
    )
}