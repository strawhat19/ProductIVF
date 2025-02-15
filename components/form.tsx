'use client';

import { toast } from 'react-toastify';
import { User } from '../shared/models/User';
import { createUser } from '../shared/database';
import { addUserToDatabase, auth, boardConverter, boardsTable, db, gridConverter, gridsTable, usersTable } from '../firebase';
import IVFSkeleton from './loaders/skeleton/ivf_skeleton';
import { useContext, useEffect, useRef, useState } from 'react';
import { formatDate, StateContext, showAlert, dev } from '../pages/_app';
import { findHighestNumberInArrayByKey, stringNoSpaces } from '../shared/constants';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';

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

export const renderFirebaseAuthErrorMessage = (erMsg: string) => {
  let erMsgQuery = erMsg?.toLowerCase();
  if (erMsgQuery.includes(`invalid-email`)) {
    return `Please use a valid email.`;
  } else if (erMsgQuery?.includes(`email-already-in-use`)) {
    return `Existing Email, Switching to Sign In`;
  } else if (erMsgQuery?.includes(`weak-password`)) {
    return `Password should be at least 6 characters`;
  } else if (erMsgQuery?.includes(`wrong-password`) || erMsgQuery?.includes(`invalid-login-credentials`)) {
    return `Incorrect Password`;
  } else if (erMsgQuery?.includes(`user-not-found`)) {
    return `User Not Found`;
  } else {
    return erMsg;
  }
}

export default function Form(props?: any) {
  const formRef = useRef(null);
  const loadedRef = useRef(false);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const [loaded, setLoaded] = useState(false);
  
  const { id, navForm, className, style } = props;

  const { 
    onSignOut, 
    setContent, 
    updates, setUpdates, 
    authState, setAuthState, 
    emailField, setEmailField,  
    user, setUser, usersLoading, users, seedUserData,
  } = useContext<any>(StateContext);

  const getAuthStateIcon = (authState) => {
    let signoutIcon = `fas fa-sign-out-alt`;
    let icon = signoutIcon;
    return icon;
  }

  const submitFormProgrammatically = (e?: any, auth_state?) => {
    e?.preventDefault();
    let form = formRef?.current;
    if (form != null) {
      authForm(e, form, auth_state);
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

  const authForm = (e?: any, frm?, value?) => {
    e.preventDefault();
    
    let form = frm ? frm : e?.target;
    let formFields = form?.children;
    let clicked = e?.nativeEvent?.submitter;
    let email = formFields?.email?.value ?? `email`;
    let clickedValue = value ? value : clicked?.value;
    let password = formFields?.password?.value ?? `pass`;

    const signInUser = (usr: User) => {
      localStorage.setItem(`last_signed_in_user_email`, usr?.email);
      localStorage.setItem(`user`, JSON.stringify(usr));
      setAuthState(`Sign Out`);
      setUser(usr);
    }

    const onSignIn = (email, password) => {
      signInWithEmailAndPassword(auth, email, password).then((userCredential: any) => {
        if (userCredential != null) {
          let existingUser = users.find(usr => usr?.email?.toLowerCase() == email?.toLowerCase());
          if (existingUser != null) {
            signInUser(existingUser);
            toast.success(`Successfully Signed In`);
          } else {
            setEmailField(true);
            setAuthState(`Sign Up`);
          }
        }
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorMessage) {
          toast.error(renderFirebaseAuthErrorMessage(errorMessage));
          console.log(`Error Signing In`, {
            error,
            errorCode,
            errorMessage
          });
        }
        return;
      });
    }

    const onSignUp = async (email, password) => {
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
        
          let newUser = await createUser(uid, rank, email, name, phone, avatar, token, verified, anonymous);

          const setUserStartingData = async (userToSeed) => {
            let {
              seeded_User,
              seeded_Grids,
              seeded_Boards,
            } = await seedUserData(userToSeed, true);

            const batchFirestore_InitialUserData = writeBatch(db);
            for (const grd of seeded_Grids) {
              const gridRef = await doc(db, gridsTable, grd?.id)?.withConverter(gridConverter);
              batchFirestore_InitialUserData.set(gridRef, grd);
            }
            for (const brd of seeded_Boards) {
              const boardRef = await doc(db, boardsTable, brd?.id)?.withConverter(boardConverter);
              batchFirestore_InitialUserData.set(boardRef, brd);
            }
            await batchFirestore_InitialUserData.commit();
            await toast.success(`Set Default Grids & Boards for: ${seeded_User?.name}`);
            return await seeded_User;
          }

          let seeded_User = await setUserStartingData(newUser);
          
          await addUserToDatabase(seeded_User).then(async () => {
            toast.success(`Signed Up & In as: ${seeded_User?.name}`);
            signInUser(seeded_User);
            form.reset();
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
          toast.error(renderFirebaseAuthErrorMessage(errorMessage));  
          if (errorMessage?.includes(`email-already-in-use`)) {
            setAuthState(`Sign In`);
          }         
        } else {
          toast.error(`Error Signing Up`);
        }
        return;
      });
    }

    switch(clickedValue) {
      default:
        console.log(`Clicked Value`, clickedValue);
        break;
      case `Next`:
        let macthingEmails = users.filter((usr: any) => usr?.email.toLowerCase() == email.toLowerCase());
        if (macthingEmails?.length > 0) {
          setAuthState(`Sign In`);
        } else {
          setAuthState(`Sign Up`);
        }
        setEmailField(true);
        break;
      case `Back`:
        setUpdates(updates + 1);
        setAuthState(`Next`);
        setEmailField(false);
        break;
      case `Sign Out`:
        onSignOut();
        break;
      case `Save`:
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
      case `Sign In`:
        if (password == ``) {
          toast.error(`Password Required`);
        } else {
          if (password?.length >= 6) {
            onSignIn(email, password);
          } else {
            toast.error(`Password must be 6 characters or greater`);
          }
        }
        break;
      case `Sign Up`:
        if (password == ``) {
          toast.error(`Password Required`);
        } else {
          if (password?.length >= 6) {
            onSignUp(email, password);
          } else {
            toast.error(`Password must be 6 characters or greater`);
          }
        }
        break;
    };
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

      {usersLoading ? <></> : <>
        {!user && <input placeholder="Email" type="email" name="email" autoComplete={`email`} required />}
        {!user && emailField && <input ref={passwordRef} placeholder="Password" type="password" minLength={6} name="password" autoComplete={`current-password`} />}
      </>}

      {(!navForm && user != null) ? <>
        {window?.location?.href?.includes(`profile`) ? <>
          <input id="name" className={`name userData`} placeholder="Name" type="text" name="status" />
          <input id="status" className={`status userData`} placeholder="Status" type="text" name="status" />
          <input id="bio" className={`bio userData`} placeholder="About You" type="text" name="bio" />
          <input id="number" className={`number userData`} placeholder="Favorite Number" type="number" name="number" />
          <input id="password" className={`editPassword userData`} placeholder="Edit Password" type="password" name="editPassword" autoComplete={`current-password`} />
          {/* <input type="color" id="color" name="color" placeholder="color" className={dark ? `dark` : `light`} data-color={`Color: ${convertHexToRGB(color)} // Hex: ${color}`} onInput={(e?: any) => changeColor(e)} defaultValue={color} /> */}
          <input id={`save_${user?.id}`} className={`save`} type="submit" name="authFormSave" style={{padding: 0}} value={`Save`} />
        </> : <></>}
      </> : <></>}

      {formButtonField(
        `Users Loading`, 
        `usersSkeleton`, 
        user ? `Sign Out` : authState,
        <input className={(user && window?.location?.href?.includes(`profile`) || (authState == `Sign In` || authState == `Sign Up`)) ? `submit half` : `submit full`} type="submit" name="authFormSubmit" value={user ? `Sign Out` : authState} />,
      )}

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