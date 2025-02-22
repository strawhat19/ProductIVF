import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import { useContext, useState } from 'react';
import { getIDParts } from '../../../shared/ID';
import { User } from '../../../shared/models/User';
import { StateContext } from '../../../pages/_app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { renderFirebaseAuthErrorMessage } from '../../form';
import { auth, updateDocFieldsWTimeStamp } from '../../../firebase';
import { maxAuthAttempts, momentFormats, withinXTime } from '../../../shared/constants';

const defaultTimePass = 24;
const defaultInterval = `hours`;

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
            let lastAttemptWithin24Hours = withinXTime(lastAttempt, defaultTimePass, defaultInterval);

            signInWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
                if (userCredential != null) {
                    let closeButton: any = document.querySelector(`.alertButton`);
                    if (closeButton) closeButton.click();
                    onAuthenticatedFunction(usr);
                }
            }).catch((error) => {
                if (lastAttemptWithin24Hours == true) {
                    if (nextAttemptNumber <= maxAuthAttempts) {
                        attemptsToUse = nextAttemptNumber;
                        updateDocFieldsWTimeStamp(usr, { 'auth.attempts': attemptsToUse, 'auth.lastAttempt': date });
                    } else {
                        const errorMessage = error.message;
                        const nextTryDate = moment(new Date(lastAttempt))?.add(defaultTimePass, defaultInterval)?.format(momentFormats?.default);
                        const customErrorMessage = `Try again after ${nextTryDate}`;
                        if (errorMessage) {
                            let attemptsRemaining = maxAuthAttempts - attemptsToUse;
                            if (attemptsRemaining > 0) {
                                toast.warn(
                                    renderFirebaseAuthErrorMessage(errorMessage) 
                                    + `, ${attemptsRemaining} Attempts Left`
                                )
                            } else {
                                toast.error(customErrorMessage);
                            }
                        }
                    }
                } else updateDocFieldsWTimeStamp(usr, { 'auth.attempts': 1, 'auth.lastAttempt': date });

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

    const isDisabled = (formSubmit = true) => {
        let disabled = false;

        let passwordEmpty = password == ``;
        let maxAttemptsReached = user?.auth?.attempts >= maxAuthAttempts;
        let lastAttemptRecent = withinXTime(user?.auth?.lastAttempt, defaultTimePass, defaultInterval);

        let submitDisabled = maxAttemptsReached && lastAttemptRecent;

        if (formSubmit == true) {
            disabled = passwordEmpty || submitDisabled;
        } else {
            disabled = submitDisabled;
        }

        return disabled;
    }

    return (
        <div className={`authenticateFormContainer gridDetailView`}>
            {/* <form className={`authenticateForm gridDetailViewForm flex isColumn`}> */}
                <div className={`authenticateFormField gridDetailFormField flex`}>
                    <div className={`authenticateFormFieldLabels flex`}>
                        <span className={`formFieldLabel authenticateFormLabel gridNameLabel`} style={{ paddingRight: 15, minWidth: `max-content` }}>
                            Enter Password to Confirm
                        </span>
                        <span className={`formFieldLabel authenticateFormLabel gridNameLabel`} style={{ paddingRight: 0 }}>
                            Attempts Remaining - {
                                (isDisabled(false) ? 0 : ((maxAuthAttempts - user?.auth?.attempts) == 0 ? maxAuthAttempts : (maxAuthAttempts - user?.auth?.attempts)))
                            } / {maxAuthAttempts} 
                        </span>
                    </div>
                    <input 
                        minLength={6} 
                        value={password}
                        type={`password`} 
                        name={`password`} 
                        autoComplete={`off`}
                        placeholder={`Password`}
                        disabled={isDisabled(false)}
                        // onPaste={(e) => e?.preventDefault()}
                        onBlur={(e) => setPassword(e?.target?.value)} 
                        onChange={(e) => setPassword(e?.target?.value)} 
                        className={`authenticateFormPasswordField gridNameField gridFormField ${isDisabled(false) ? `disabledField` : ``}`}
                    />
                </div>
                <button disabled={isDisabled()} className={`authenticateFormSubmitButton gridDetailViewFormSubmit gridFormField flex gap5 ${isDisabled() ? `disabledField` : `hoverBright`}`} type={`submit`}>
                    <i className={`modalFormButtonIcon fas fa-trash`} style={{ color: `red` }} />
                    {actionLabel}
                </button>
            {/* </form> */}
        </div>
    )
}