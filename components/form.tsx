'use client';

import { toast } from 'react-toastify';
import { User } from '../shared/models/User';
import { addUserToDatabase, auth, db } from '../firebase';
import { useContext, useEffect, useRef, useState } from 'react';
import { formatDate, StateContext, showAlert } from '../pages/_app';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { findHighestNumberInArrayByKey, isValid, removeNullAndUndefinedProperties } from '../shared/constants';

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

export const renderErrorMessage = (erMsg: string) => {
  let erMsgQuery = erMsg?.toLowerCase();
  if (erMsgQuery.includes(`invalid-email`)) {
    return `Please use a valid email.`;
  } else if (erMsgQuery?.includes(`email-already-in-use`)) {
    return `Email is already in use.`;
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
  const { navForm, style } = props;
  const loadedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const { user, setUser, setBoards, updates, setUpdates, setContent, authState, setAuthState, emailField, setEmailField, users, setColor, setDark, useDatabase } = useContext<any>(StateContext);

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

  const authForm = (e?: any) => {
    e.preventDefault();
    
    let form = e?.target;
    let formFields = form?.children;
    let clicked = e?.nativeEvent?.submitter;
    let email = formFields?.email?.value ?? `email`;
    let password = formFields?.password?.value ?? `pass`;

    const signInUser = (usr: User) => {
      localStorage.setItem(`user`, JSON.stringify(usr));
      setAuthState(`Sign Out`);
      setUser(usr);
      if (isValid(usr?.boards)) {
        setBoards(usr?.boards);
      }
    }

    const onSignOut = () => {
      setUser(null);
      setAuthState(`Next`);
      setEmailField(false);
      setUpdates(updates + 1);
      localStorage.removeItem(`user`);
      let hasLocalBoards = localStorage.getItem(`local_boards`);
      if (hasLocalBoards) {
        let localBoards = JSON.parse(hasLocalBoards);
        setBoards(localBoards);
      } else {
        setBoards([]);
      }
    }

    const onSignIn = (email, password) => {
      if (useDatabase == true) {
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
            toast.error(renderErrorMessage(errorMessage));
            console.log(`Error Signing In`, {
              error,
              errorCode,
              errorMessage
            });
          }
          return;
        });
      } else {
        toast.error(`Database not connected or not being used`);
      }
    }

    const onSignUp = (email, password) => {
      if (useDatabase == true) {
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
            let userData = {
              uid,
              name,
              email,
              phone,
              avatar,
              rank: highestRank + 1,
              auth: {
                token,
                verified,
                anonymous,
              }
            }

            let cleanedUser = removeNullAndUndefinedProperties(userData);
            let newUser = new User(cleanedUser);

            await addUserToDatabase(newUser).then(() => {
              toast.success(`Signed Up & In as: ${newUser?.name}`);
              console.log(`New User`, newUser);
              signInUser(newUser);
              form.reset();
            });
          } else {
            toast.error(`Error on Sign Up`);
          }
        }).catch((error) => {
          console.log(`Error Signing Up`, error);
          const errorMessage = error.message;
          if (errorMessage) {
            toast.error(renderErrorMessage(errorMessage));             
          } else {
            toast.error(`Error Signing Up`);
          }
          return;
        });
      } else {
        toast.error(`Database not connected or not being used`);
      }
    }

    switch(clicked?.value) {
      default:
        console.log(`Clicked Value`, clicked?.value);
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

  return <>
    <form id={props.id} onSubmit={authForm} className={`flex authForm customButtons ${props.className}`} style={style}>

      {!user && <input placeholder="Email" type="email" name="email" autoComplete={`email`} required />}
      {!user && emailField && <input placeholder="Password" type="password" minLength={6} name="password" autoComplete={`current-password`} />}

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

      <input className={(user && window?.location?.href?.includes(`profile`) || (authState == `Sign In` || authState == `Sign Up`)) ? `submit half` : `submit full`} type="submit" name="authFormSubmit" value={user ? `Sign Out` : authState} />

      {(authState == `Sign In` || authState == `Sign Up`) && <input id={`back`} className={`back authFormBack`} type="submit" name="authFormBack" value={`Back`} />}
      
    </form>
  </>
}