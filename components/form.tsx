'use client';

import { toast } from 'react-toastify';
import { AuthStates } from '../shared/types/types';
import { doc, writeBatch } from 'firebase/firestore';
import { FeatureIDs } from '../shared/admin/features';
import IVFSkeleton from './loaders/skeleton/ivf_skeleton';
import ConfirmAction from './context-menus/confirm-action';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useContext, useEffect, useRef, useState } from 'react';
import { createUser, Roles, User } from '../shared/models/User';
import FeatureFlagBadge from '../shared/admin/feature-flag-badge';
import { formatDate, StateContext, showAlert, dev } from '../pages/_app';
import { defaultAuthenticateLabel, findHighestNumberInArrayByKey, stringNoSpaces } from '../shared/constants';
import { addUserToDatabase, auth, boardConverter, boardsTable, db, gridConverter, gridsTable, updateDocFieldsWTimeStamp } from '../firebase';

export const convertHexToRGB = (HexString?:any, returnObject?: any) => {
  let r = parseInt(HexString.slice(1, 3), 16),
  g = parseInt(HexString.slice(3, 5), 16),
  b = parseInt(HexString.slice(5, 7), 16);
  let rgbaString = `rgba(${r}, ${g}, ${b}, 1)`;
  if (returnObject) {
    return { r, g, b };
  } else {
    return rgbaString;
  }
}

export const isShadeOfBlack = (HexString?:any) => {
  let darkColorBias = 50;
  let returnObject = true;
  let rgb: any = convertHexToRGB(HexString, returnObject);
  return (rgb?.r < darkColorBias) && (rgb?.g < darkColorBias) && (rgb?.b < darkColorBias);
}

export const getMatchingUsersToEmail = (query, usrs: User[]) => {
  let matchingEmails = usrs.filter((usr: any) => {
    let usrNam = usr?.name.toLowerCase();
    let usrEml = usr?.email.toLowerCase();
    let emlFieldValue = query.toLowerCase();
    let queryFields = [usrNam, usrEml];
    return queryFields?.includes(emlFieldValue);
  });
  return matchingEmails;
}

export const renderFirebaseAuthErrorMessage = (erMsg: string) => {
  let erMsgQuery = erMsg?.toLowerCase();
  if (erMsgQuery.includes(`invalid-email`)) {
    return `Please use a valid email.`;
  } else if (erMsgQuery?.includes(`email-already-in-use`)) {
    return `Existing Email or Username, Switching to Sign In`;
  } else if (erMsgQuery?.includes(`weak-password`)) {
    return `Password should be at least 6 characters`;
  } else if (erMsgQuery?.includes(`wrong-password`) || erMsgQuery?.includes(`invalid-login-credentials`)) {
    return `Incorrect Password`;
  } else if (erMsgQuery?.includes(`user-not-found`)) {
    return `User Not Found`;
  } else if (erMsgQuery?.includes(`too-many-requests`)) {
    return `Too Many Requests, Try Again Later`;
  } else {
    return erMsg;
  }
}

export default function Form(props?: any) {
  const formRef = useRef(null);
  const loadedRef = useRef(false);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const [, setLoaded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const { id, navForm, className, style } = props;

  const { 
    onSignIn,
    onSignOut, 
    setLoading,
    setContent,
    signInUser, 
    usersLoading,
    setUpNextGrid,
    setSystemStatus,
    isFeatureEnabled,
    toggleMenuIfMobile,
    updates, setUpdates, 
    setAuthenticateOpen,
    setOnAuthenticateLabel,
    authState, setAuthState, 
    emailField, setEmailField,  
    user, users, seedUserData,
    setOnAuthenticateFunction,
  } = useContext<any>(StateContext);

  const getAuthStateIcon = (authState) => {
    let cancelIcon = `fas fa-ban`;
    let trashIcon = `fas fa-trash`;
    let signoutIcon = `fas fa-sign-out-alt`;
    let icon = authState == AuthStates.Delete ? trashIcon : authState == AuthStates.Cancel ? cancelIcon : signoutIcon;
    return icon;
  }

  const submitFormProgrammatically = (e?: any, auth_state?) => {
    e?.preventDefault();
    let form = formRef?.current;
    if (form != null) {
      authForm(e, form, auth_state);
    }
  }

  const onDeleteOrCancelUser = (e, initialConfirm = true) => {
    const openAuthenticationForm = () => {
      setOnAuthenticateLabel(defaultAuthenticateLabel);
      setOnAuthenticateFunction(`Default`);
      setAuthenticateOpen(true);
      setUpNextGrid(null);
    }
    if (showConfirm == true) {
      if (!initialConfirm) openAuthenticationForm();
      setShowConfirm(false);
    } else {
      if (user?.data?.gridIDs?.length > 0) {
        setShowConfirm(true);
      } else openAuthenticationForm();
    }
  }

  // const changeColor = (colorRangePickerEvent?: any) => {
  //   let currentColor: any = colorRangePickerEvent.target.value;
  //   localStorage.setItem(`color`, JSON.stringify(currentColor));
  //   setColor(currentColor);

  //   let r = parseInt(currentColor.slice(1, 3), 16),
  //   g = parseInt(currentColor.slice(3, 5), 16),
  //   b = parseInt(currentColor.slice(5, 7), 16);

  //   let luminance = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
  //   if (luminance > 128) {
  //     setDark(false);
  //   } else {
  //     setDark(true);
  //   }    
  // }

  const formButtonField = (label, className, auth_state, input) => <>
    {usersLoading ? (
      <IVFSkeleton 
        label={label} 
        labelSize={14}
        showLoading={true}
        className={className} 
        skeletonContainerGap={15}
        skeletonContainerWidth={`100%`}
        skeletonContainerPadding={`5px 12px`}
      />
    ) : (
      <div className={`formButtonsField ${stringNoSpaces(auth_state)}_AuthState`} onClick={(e) => formRef != null ? submitFormProgrammatically(e, auth_state) : undefined}>
        <i style={{ color: `var(--gameBlue)` }} className={`formButtonsFieldIcon ${getAuthStateIcon(auth_state)}`} />
        {input}
      </div>
    )}
  </>

  const switchToSignIn = (email, password) => {
    if (password && (password != `` && password?.length >= 6)) {
      onSignIn(email, password);
    } else {
      toast.warn(renderFirebaseAuthErrorMessage(`email-already-in-use`));
      setAuthState(AuthStates.Sign_In);
    }
  }

  const onSignUp = async (email, password, form) => {
    createUserWithEmailAndPassword(auth, email, password).then(async (userCredential: any) => {
      if (userCredential != null) {
        let { 
          uid, 
          photoURL: avatar, 
          displayName: name, 
          accessToken: token, 
          phoneNumber: phone, 
          isAnonymous: anonymous, 
          emailVerified: verified, 
        } = userCredential?.user;

        let highestRank = await findHighestNumberInArrayByKey(users, `rank`);
        let rank = highestRank + 1;
      
        let default_Role_On_Create = dev() ? Roles.Developer : Roles.Subscriber;
        let newUser = await createUser(uid, rank, email, name, phone, avatar, token, verified, anonymous, default_Role_On_Create);

        const setUserStartingData = async (userToSeed) => {
          let {
            seeded_User,
            seeded_Grids,
            seeded_Boards,
          } = await seedUserData(userToSeed);

          const batchFirestore_InitialUserData = writeBatch(db);
          for (const grd of seeded_Grids) {
            const gridRef = await doc(db, gridsTable, grd?.id)?.withConverter(gridConverter);
            batchFirestore_InitialUserData.set(gridRef, grd);
          }
          for (const brd of seeded_Boards) {
            const boardRef = await doc(db, boardsTable, brd?.id)?.withConverter(boardConverter);
            batchFirestore_InitialUserData.set(boardRef, brd);
          }
          return await {seeded_User, batchFirestore_InitialUserData};
        }

        let { seeded_User, batchFirestore_InitialUserData } = await setUserStartingData(newUser);
        
        await addUserToDatabase(seeded_User).then(async () => {
          toast.success(`Signed Up & In as: ${seeded_User?.name}`);
          signInUser(seeded_User);
          form.reset();
          await batchFirestore_InitialUserData.commit();
          await toast.success(`Set Default Grids & Boards for: ${seeded_User?.name}`);
          toggleMenuIfMobile();
        }).catch(signUpAndSeedError => {
          let errorMessage = `Error on Sign Up & Set Default Data`;
          console.log(errorMessage, signUpAndSeedError);
          toast.error(errorMessage);
          return;
        });

      } else {
        toast.error(`Error on Sign Up`);
        return;
      }
    }).catch((error) => {
      console.log(`Error Signing Up`, error);
      const errorMessage = error.message;
      if (errorMessage) {
        if (errorMessage?.includes(`email-already-in-use`)) {
          switchToSignIn(email, password);
        } else {
          toast.error(renderFirebaseAuthErrorMessage(errorMessage));  
        }         
      } else {
        toast.error(`Error Signing Up`);
      }
      return;
    });
  }

  const authForm = (e?: any, frm?, value?) => {
    e.preventDefault();
    
    let form = frm ? frm : e?.target;
    let formFields = form?.children;
    let clicked = e?.nativeEvent?.submitter;
    let email = formFields?.email?.value ?? `email`;
    let clickedValue = value ? value : clicked?.value;
    let password = formFields?.password?.value ?? `pass`;

    let matchingUsers = getMatchingUsersToEmail(email, users);

    switch(clickedValue) {
      default:
        dev() && console.log(`Clicked Value`, clickedValue);
        break;
      case AuthStates.Next:
        if (matchingUsers?.length > 0) {
          setAuthState(AuthStates.Sign_In);
        } else {
          setAuthState(AuthStates.Sign_Up);
        }
        setEmailField(true);
        break;
      case AuthStates.Back:
        setUpdates(updates + 1);
        setAuthState(AuthStates.Next);
        setEmailField(false);
        break;
      case AuthStates.Sign_Out:
        updateDocFieldsWTimeStamp(user, { 'auth.signedIn': false })?.then(() => onSignOut());
        break;
      case AuthStates.Save:
        let emptyFields = [];
        let fieldsToUpdate = [];

        for (let i = 0; i < formFields.length; i++) {
          const input = formFields[i];
          if (input?.classList?.contains(`userData`)) {
            if (input.value === ``) {
              emptyFields.push(input?.placeholder);
            } else {
              fieldsToUpdate.push(input);
            }
          }
        }

        if (fieldsToUpdate.length == 0) {
          showAlert(`The Form was NOT Saved.`, `You Can Fill`, emptyFields);
        } else {
          let updatedUser = { ...user, updated: formatDate(new Date()) };
          Object.assign(updatedUser, ...([...fieldsToUpdate].map(input => {
            if (input?.classList?.contains(`userData`)) {
              if (input?.id == `bio`) setContent(formFields?.bio?.value);
              return {[input.id]: input.value}
            }
          })));
        }
        break;
      case AuthStates.Sign_In:
        if (password == ``) {
          toast.error(`Password Required`);
        } else {
          if (password?.length >= 6) {
            if (matchingUsers?.length > 0) {
              let emailToUse = matchingUsers[0]?.email;
              onSignIn(emailToUse, password);
            }
          } else {
            toast.error(`Password must be 6 characters or greater`);
          }
        }
        break;
      case AuthStates.Sign_Up:
        if (matchingUsers?.length > 0) {
          switchToSignIn(matchingUsers[0]?.email, password);
        } else {
          if (password == ``) {
            toast.error(`Password Required`);
          } else {
            if (password?.length >= 6) {
              if (email?.includes(`@`) && (
                email?.includes(`.com`) || email?.includes(`.net`) || email?.includes(`.org`) || email?.includes(`.gov`)
                || email?.includes(`.app`) || email?.includes(`.io`) || email?.includes(`.ai`) || email?.includes(`.eu`)
              )) {
                onSignUp(email, password, form);
              } else {
                const constructedUsernameFromEmail = `${email}@${email}.com`;
                onSignUp(constructedUsernameFromEmail, password, form);
              }
            } else {
              toast.error(`Password must be 6 characters or greater`);
            }
          }
        }
        break;
      case AuthStates.Cancel:
      case AuthStates.Delete:
        onDeleteOrCancelUser(e);
        break;
    };

    setTimeout(() => {
      setSystemStatus(`${users?.length} User(s)`);
      setLoading(false);
    }, 500)
  }

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    setLoaded(true);
  }, [user, users, authState]);

  useEffect(() => {
    if (emailField && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [emailField]);

  return <>
    <form ref={formRef} {...id && { id }} onSubmit={authForm} className={`flex authForm customButtons ${className} ${stringNoSpaces(authState)}_formButton`} style={style}>
      {/* Sign In // Sign Up */}
      {usersLoading ? <></> : <>
        {!user && <input placeholder={`Email or Username`} type={`email`} name={`email`} autoComplete={`off`} required />}
        {!user && emailField && <input ref={passwordRef} placeholder={`Password`} type={`password`} minLength={6} name={`password`} autoComplete={`off`} />}
      </>}

      {/* Profile Edit Form */}
      {(!navForm && user != null) ? <>
        {window?.location?.href?.includes(`profile`) ? <>
          <input className={`name userData`} placeholder={`Name`} type={`text`} name={`status`} />
          <input className={`status userData`} placeholder={`Status`} type={`text`} name={`status`} />
          <input className={`bio userData`} placeholder={`About You`} type={`text`} name={`bio`} />
          <input className={`number userData`} placeholder={`Favorite Number`} type={`number`} name={`number`} />
          <input className={`editPassword userData`} placeholder={`Edit Password`} type={`password`} name={`editPassword`} autoComplete={`off`} />
          {/* <input type={`color`} name={`color`} placeholder={`color`} className={dark ? `dark` : `light`} data-color={`Color: ${convertHexToRGB(color)} // Hex: ${color}`} onInput={(e?: any) => changeColor(e)} defaultValue={color} /> */}
          <input className={`save`} type={`submit`} name={`authFormSave`} style={{padding: 0}} value={`Save`} />
        </> : <></>}
      </> : <></>}

      {/* Delete User */}
      {isFeatureEnabled(FeatureIDs.Delete_Self) && (
        <div className={`formFieldWithConfirm featureFlag`} style={{ position: `relative` }}>
          <FeatureFlagBadge featureID={FeatureIDs.Delete_Self} />
          {formButtonField(
            `Users Loading`, 
            `usersSkeleton`, 
            showConfirm ? AuthStates.Cancel : AuthStates.Delete,
            <input className={`authFormDelete`} type={`submit`} name={`authFormSubmit`} value={showConfirm ? AuthStates.Cancel : AuthStates.Delete} />
          )}
          {showConfirm && (
            <ConfirmAction className={`formUserConfirmAction`} onConfirm={(e) => onDeleteOrCancelUser(e, false)} style={{ right: 0, top: 40 }} />
          )}
        </div>
      )}

      {/* Sign In // Sign Up // Sign Out */}
      {formButtonField(
        `Users Loading`, 
        `usersSkeleton`, 
        user ? `Sign Out` : authState,
        <input className={(user && window?.location?.href?.includes(`profile`) || (authState == `Sign In` || authState == `Sign Up`)) ? `submit half` : `submit full`} type="submit" name="authFormSubmit" value={user ? `Sign Out` : authState} />,
      )}

      {/* Back */}
      {(authState == `Sign In` || authState == `Sign Up`) && (
        formButtonField(
          `Users Loading`, 
          `usersSkeleton`, 
          `Back`,
          <input className={`back authFormBack`} type="submit" name="authFormBack" value={`Back`} />
        )
      )}
    </form>
  </>
}