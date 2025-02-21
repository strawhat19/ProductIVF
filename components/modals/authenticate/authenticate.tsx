import { toast } from 'react-toastify';
import { useContext, useState } from 'react';
import { getIDParts } from '../../../shared/ID';
import { User } from '../../../shared/models/User';
import { dev, StateContext } from '../../../pages/_app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { renderFirebaseAuthErrorMessage } from '../../form';
import { auth, updateDocFieldsWTimeStamp } from '../../../firebase';
import { maxAuthAttempts, withinXTime } from '../../../shared/constants';

export const onAuthenticate = (usr: User, password: string, onAuthenticatedFunction, e?: any) => {
    if (e) e?.preventDefault();

    if (password == ``) {
        toast.error(`Password Required`);
        return;
    } else {
        if (password?.length >= 6) {
            const { email } = usr;
            const { date } = getIDParts();
            const { attempts, lastAttempt } = usr?.auth;

            let attemptsToUse = attempts;
            let nextAttemptNumber = attemptsToUse + 1;
            let lastAttemptWithin24Hours = withinXTime(lastAttempt, 24, `hours`);

            signInWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
                if (userCredential != null) {
                    let closeButton: any = document.querySelector(`.alertButton`);
                    if (closeButton) closeButton.click();
                    onAuthenticatedFunction(usr);
                }
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                if (lastAttemptWithin24Hours == true) {
                    if (nextAttemptNumber <= maxAuthAttempts) {
                        attemptsToUse = nextAttemptNumber;
                        updateDocFieldsWTimeStamp(usr, { 'auth.attempts': attemptsToUse, 'auth.lastAttempt': date })?.then(() => {
                            dev() && console.log(`Authenticate Form Submit`, { 
                                date,
                                email, 
                                password, 
                                attemptsToUse, 
                                nextAttemptNumber,
                                lastAttemptWithin24Hours, 
                            });
                        });
                    } else {
                        dev() && console.log(`Out of Attempts`, { attemptsToUse, email, password });
                    }
                }

                if (errorMessage) {
                    toast.error(
                        renderFirebaseAuthErrorMessage(errorMessage) 
                        + `, ${maxAuthAttempts - attemptsToUse} Attempts Left`
                    );
                    console.log(`Error Authenticating`, {
                        error,
                        errorCode,
                        errorMessage,
                    });
                }

                return;
            });
        } else {
            toast.error(`Password must be 6 characters or greater`);
            return;
        }
    }
}

export default function Authenticate({ actionLabel = `Delete User & All Data` }: any) {
    let [password, setPassword] = useState(``);
    let { user } = useContext<any>(StateContext);

    return (
        <div className={`authenticateFormContainer gridDetailView`}>
            {/* <form className={`authenticateForm gridDetailViewForm flex isColumn`}> */}
                <div className={`authenticateFormField gridDetailFormField flex`}>
                    <div className={`authenticateFormFieldLabels flex`}>
                        <span className={`formFieldLabel authenticateFormLabel gridNameLabel`} style={{ paddingRight: 15, minWidth: `max-content` }}>
                            Enter Password to Confirm
                        </span>
                        <span className={`formFieldLabel authenticateFormLabel gridNameLabel`} style={{ paddingRight: 0 }}>
                            Attempts Remaining - {user?.auth?.attempts} / {maxAuthAttempts} 
                        </span>
                    </div>
                    <input 
                        minLength={6} 
                        value={password}
                        type={`password`} 
                        name={`password`} 
                        autoComplete={`off`}
                        placeholder={`Password`}
                        // onPaste={(e) => e?.preventDefault()}
                        onBlur={(e) => setPassword(e?.target?.value)} 
                        onChange={(e) => setPassword(e?.target?.value)} 
                        disabled={user?.auth?.attempts >= maxAuthAttempts}
                        className={`authenticateFormPasswordField gridNameField gridFormField ${user?.auth?.attempts >= maxAuthAttempts ? `disabledField` : ``}`}
                    />
                </div>
                <button disabled={((user?.auth?.attempts >= maxAuthAttempts) || password == ``)} className={`authenticateFormSubmitButton gridDetailViewFormSubmit gridFormField flex gap5 ${((user?.auth?.attempts >= maxAuthAttempts) || password == ``) ? `disabledField` : `hoverBright`}`} type={`submit`}>
                    <i className={`modalFormButtonIcon fas fa-trash`} style={{ color: `red` }} />
                    {actionLabel}
                </button>
            {/* </form> */}
        </div>
    )
}