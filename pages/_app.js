import '../main.scss';
import 'react-toastify/dist/ReactToastify.css';

import ReactDOM from 'react-dom/client';
import { User } from '../shared/models/User';
import { toast, ToastContainer } from 'react-toastify';
import { isValid, logToast } from '../shared/constants';
import { AnimatePresence, motion } from 'framer-motion';
import { collection, onSnapshot, query, where  } from 'firebase/firestore';
import { AuthStates, GridTypes, Types } from '../shared/types/types';
import { createContext, useRef, useState, useEffect } from 'react';
import ContextMenu from '../components/context-menus/context-menu';
import { renderFirebaseAuthErrorMessage } from '../components/form';
import { seedUserData as generateSeedUserData } from '../shared/database';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db, userConverter, gridDataCollectionNames, usersTable, gridsTable, gridConverter } from '../firebase';
import { Grid } from '../shared/models/Grid';
import { Board } from '../shared/models/Board';
import { List } from '../shared/models/List';
import { Item } from '../shared/models/Item';
import { Task } from '../shared/models/Task';

export const StateContext = createContext({});

export const getPage = () => capitalizeAllWords(window.location.pathname.replace(`/`,``));
export const getCurrentPageName = () => window.location.hash.slice(window.location.hash.lastIndexOf(`/`)).replace(`/`, ``);

export const setThemeMode = (theme) => {
  let html = document.documentElement;
  if (html.classList.contains(`dark`)) html.classList.remove(`dark`);
  if (html.classList.contains(`light`)) html.classList.remove(`light`);
  html.classList.add(theme);
  html.style = `color-scheme: ${theme}`;
  html.setAttribute(`data-theme`, theme);
  localStorage.setItem(`theme`, theme);
}

export const setThemeUI = () => {
  let themeMode = localStorage.getItem(`theme`) ? localStorage.getItem(`theme`) : `dark`;
  localStorage.setItem(`alertOpen`, false);
  setThemeMode(themeMode);
}

export const formatDate = (date, specificPortion) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? `PM` : `AM`;
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? `0` + minutes : minutes;
  let strTime = hours + `:` + minutes + ` ` + ampm;
  let completedDate = strTime + ` ` + (date.getMonth() + 1) + `/` + date.getDate() + `/` + date.getFullYear();
  if (specificPortion == `time`) {
    completedDate = strTime;
  } else if (specificPortion == `date`) {
    completedDate = (date.getMonth() + 1) + `/` + date.getDate() + `/` + date.getFullYear();
  } else {
    completedDate = strTime + ` ` + (date.getMonth() + 1) + `/` + date.getDate() + `/` + date.getFullYear();
  }
  return completedDate;
};

export const generateID = (existingIDs) => {
  let newID = Math.random().toString(36).substr(2, 9);
  if (existingIDs && existingIDs.length > 0) {
    while (existingIDs.includes(newID)) {
      newID = Math.random().toString(36).substr(2, 9);
    }
  }
  return newID;
}

export const generateUniqueID = (existingIDs, name) => {
  let newID = generateID(existingIDs);
  if (name && existingIDs && existingIDs.length > 0) {
    return `${name}_${existingIDs.length + 1}_${formatDate(new Date())}_${newID}`.replace(/\s+/g, `_`).replace(/[:/]/g, `_`);
  } else if (name && !existingIDs) {
    return `${name}_${formatDate(new Date())}_${newID}`.replace(/\s+/g, `_`).replace(/[:/]/g, `_`);
  } else {
    return `${formatDate(new Date())}_${newID}`.replace(/\s+/g, `_`).replace(/[:/]/g, `_`);
  }
};

export const initialBoardData = {
  name: `Board`,
  created: formatDate(new Date()),
  id: generateUniqueID(false, `board`),
  items:{
    item_1_1_06_AM_2_21_2023_puvkbf5jt: {
      subtasks: [],
      complete: false,
      content: `AdHoc Bug Fixes`,
      created: `1:06 AM 2/21/2023`,
      updated: `1:07 AM 2/21/2023`,
      id: `item_1_1_06_AM_2_21_2023_puvkbf5jt`,
    },
    item_2_1_07_AM_2_21_2023_qmpi9w53n: {
      subtasks: [],
      complete: false,
      created: `1:07 AM 2/21/2023`,
      updated: `1:08 AM 2/21/2023`,
      content: `Deploy New Code Changes`,
      id: `item_2_1_07_AM_2_21_2023_qmpi9w53n`,
    },
    item_2_1_07_AM_2_21_2023_x1qs0ba58: {
      subtasks: [],
      complete: true,
      content: `Release 1.5`,
      created: `1:07 AM 2/21/2023`,
      updated: `1:07 AM 2/21/2023`,
      id: `item_2_1_07_AM_2_21_2023_x1qs0ba58`,
    },
    item_2_1_07_AM_2_21_2023_cod2k6ysu: {
      subtasks: [],
      complete: true,
      created: `1:07 AM 2/21/2023`,
      updated: `1:07 AM 2/21/2023`,
      content: `Fix Notification Bugs`,
      id: `item_2_1_07_AM_2_21_2023_cod2k6ysu`,
    },
    item_2_1_08_AM_2_21_2023_cph525xnf: {
      subtasks: [],
      complete: false,
      created: `1:08 AM 2/21/2023`,
      content: `Refine Items In Board`,
      id: `item_2_1_08_AM_2_21_2023_cph525xnf`,
    }
  },
  columns: {
    list_1_1_06_AM_2_21_2023_0fl98rv5v: {
      title: `To Do`,
      id: `list_1_1_06_AM_2_21_2023_0fl98rv5v`,
      itemIds: [`item_2_1_08_AM_2_21_2023_cph525xnf`],
    },
    list_2_1_06_AM_2_21_2023_rvptjgqw1: {
      title: `Active`,
      id: `list_2_1_06_AM_2_21_2023_rvptjgqw1`,
      itemIds: [`item_1_1_06_AM_2_21_2023_puvkbf5jt`, `item_2_1_07_AM_2_21_2023_qmpi9w53n`],
    },
    list_3_1_06_AM_2_21_2023_dv0ld5pot: {
      title: `Complete`,
      id: `list_3_1_06_AM_2_21_2023_dv0ld5pot`, 
      itemIds: [`item_2_1_07_AM_2_21_2023_cod2k6ysu`, `item_2_1_07_AM_2_21_2023_x1qs0ba58`],
    }
  },
  columnOrder: [
    `list_1_1_06_AM_2_21_2023_0fl98rv5v`,
    `list_2_1_06_AM_2_21_2023_rvptjgqw1`,
    `list_3_1_06_AM_2_21_2023_dv0ld5pot`,
  ],
};

export const dev = (item, source) => {
  if (window.location.host.includes(`local`)) {
    if (item) {
      console.log(`Dev Log`, item);
    } else if (item && source) {
      console.log(`Dev Log`, item, `From`, source);
    }
    return true;
  } else {
    return false;
  }
}

export const getNumberFromString = (string) => {
  let result = string.match(/\d+/);
  let number = parseInt(result[0]);
  return number;
}

export const createXML = (xmlString) => {
  let div = document.createElement(`div`);
  div.innerHTML = xmlString.trim();
  return div.firstChild;
}

export const replaceAll = (str, search, replacement) => {
  return str.replace(new RegExp(search, `g`), replacement);
}

export const capWords = (str) => {
  return str.replace(/\b\w/g, (match) => {
    return match.toUpperCase();
  });
}

export const capitalizeAllWords = (string, underScores) => {
  let newString;
  if (underScores) {
    if (string != null || string != undefined) {
      const words = string.replace(/_/g, ` `).split(` `);
      const capitalizedWords = words.map((word) => {
        newString = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        return newString;
      });
      newString = capitalizedWords.join(`_`);
      return newString;
    }
  } else {
    if (string != null || string != undefined) {
      newString = string.split(` `).map((word) => word?.charAt(0)?.toUpperCase() + word?.slice(1).toLowerCase()).join(` `);
      return newString;
    }
  }
};

export const cutOffTextAndReplace = (string, end, replacement) => {
  if (!replacement) {
    replacement = `...` || `-`;
  }
  return string?.length > end ? string?.substring(0, end - 1) + replacement : string;
};

export const removeDuplicateObjectFromArray = (arrayOfObjects) => {
  const uniqueArray = arrayOfObjects?.filter((value, index) => {
    const _value = JSON.stringify(value);
    return index === arrayOfObjects?.findIndex((obj) => {
        return JSON.stringify(obj) === _value;
    });
  });
  return uniqueArray;
};

export const getFormValuesFromFields = (formFields) => {
  for (let i = 0; i < formFields.length; i++) {
    let field = formFields[i];
    if (field.type != `submit`) {
      console.log(field.type, field.value);
    };
  }
};

export const updateOrAdd = (obj, arr) => {
  let index = arr.findIndex((item) => item.name === obj.name);
  if (index !== -1) {
    arr[index] = obj;
  } else {
    arr.push(obj);
  }
  return arr;
};

export const genUUIDNumbers = (existingIDs) => {
  let newID;
  do {
    newID = Math.floor(Math.random() * 1000000); // generate a random integer between 0 and 999999
  } while (existingIDs.includes(newID)); // keep generating a new ID until it's not already in the existing IDs array
  return newID;
}

export const getRGBAColorFromHue = (hue, alpha) => {
  const saturation = 1;
  const lightness = 0.5;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;

  let r, g, b;
  if (hue >= 0 && hue < 60) {
    r = chroma;
    g = x;
    b = 0;
  } else if (hue >= 60 && hue < 120) {
    r = x;
    g = chroma;
    b = 0;
  } else if (hue >= 120 && hue < 180) {
    r = 0;
    g = chroma;
    b = x;
  } else if (hue >= 180 && hue < 240) {
    r = 0;
    g = x;
    b = chroma;
  } else if (hue >= 240 && hue < 300) {
    r = x;
    g = 0;
    b = chroma;
  } else if (hue >= 300 && hue < 360) {
    r = chroma;
    g = 0;
    b = x;
  } else {
    r = 0;
    g = 0;
    b = 0;
  }

  const red = Math.round((r + m) * 255);
  const green = Math.round((g + m) * 255);
  const blue = Math.round((b + m) * 255);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export const defaultLists = [
  {id: `list_1_9_21_PM_2_17_2023_69zscemwk`, name: `ProductIVF Features`, created: formatDate(new Date()), items: [
    {id: `item_1_9_21_PM_2_17_2023_68yscemwk`, content: `Corner Draggable`, complete: false, created: formatDate(new Date())},
    {id: `item_2_9_22_PM_2_17_2023_r2epommeu`, content: `Switch to User`, complete: false, created: formatDate(new Date())},
  ]},
];

export const showAlert = async (title, component, width, height, top = `0px`) => {
  let isAlertOpen = JSON.parse(localStorage.getItem(`alertOpen`)) == true;
  if (isAlertOpen) return;
  let overlay = document.createElement(`div`);
  overlay.className = `overlay`;
  document.body.appendChild(overlay);

  let alertDialog = document.createElement(`div`);
  alertDialog.className = `alert`;

  // Add transition styles for smooth fade-in/out
  overlay.style.opacity = 0;
  // overlay.style.transform = `translateY(-50px)`;
  overlay.style.transition = `opacity 0.3s ease-out, transform 0.3s ease-out`;

  alertDialog.style.top = top;
  alertDialog.style.opacity = 0;
  if (width) alertDialog.style.width = `${width}`;
  if (height) alertDialog.style.height = `${height}`;
  alertDialog.style.transform = `translateY(-50px)`;
  alertDialog.style.transition = `opacity 0.3s ease-out, transform 0.3s ease-out`;

  ReactDOM.createRoot(alertDialog).render(<>
    <h2 className={`alertTitle`}>{title}</h2>
    <div className={`inner`}>
      {component}
    </div>
    <button onClick={(e) => {
      overlay.style.opacity = 0;
      // overlay.style.transform = `translateY(-50px)`;
      alertDialog.style.opacity = 0;
      alertDialog.style.transform = `translateY(-50px)`;

      // Remove the alert and overlay from the DOM after the animation is complete
      setTimeout(() => {
        document.body.removeChild(overlay);
        localStorage.setItem(`alertOpen`, false);
      }, 300);
    }} className={`alertButton iconButton`}>X</button>
  </>);

  overlay.appendChild(alertDialog);
  localStorage.setItem(`alertOpen`, true);

  // Trigger reflow to ensure the styles are applied before animating
  void alertDialog.offsetWidth;

  // Fade in the alert
  overlay.style.opacity = 1;
  // overlay.style.transform = `translateY(0)`;
  alertDialog.style.opacity = 1;
  alertDialog.style.transform = `translateY(0)`;

  // Add a click event listener to the overlay that dismisses the alert if clicked outside the alert content
  overlay.addEventListener(`click`, (e) => {
    if (!alertDialog.contains(e.target)) {
      // Click occurred outside the alert content
      // Fade out the alert and overlay
      alertDialog.style.opacity = 0;
      alertDialog.style.transform = `translateY(-50px)`;
      overlay.style.opacity = 0;

      // Remove the alert and overlay from the DOM after the animation is complete
      setTimeout(() => {
        document.body.removeChild(overlay);
        localStorage.setItem(`alertOpen`, false);
      }, 300);
    }
  });
}

export default function ProductIVF({ Component, pageProps, router }) {
  let brwser = ``;
  let menuRef = useRef(null);
  let loaded = useRef(false);
  let mobileMenuBreakPoint = 697;
  let { id, gridid } = router.query;

  let [IDs, setIDs] = useState([]);
  let [rte, setRte] = useState(``);
  let [page, setPage] = useState(``);
  let [qotd, setQotd] = useState(``);
  let [width, setWidth] = useState(0);
  let [color, setColor] = useState(``);
  let [dark, setDark] = useState(false);
  let [updates, setUpdates] = useState(0);
  let [onMac, setOnMac] = useState(false);
  let [focus, setFocus] = useState(false);
  let [browser, setBrowser] = useState(``);
  let [devEnv, setDevEnv] = useState(false);
  let [mobile, setMobile] = useState(false);
  let [loading, setLoading] = useState(true);
  let [highScore, setHighScore] = useState(0);
  let [platform, setPlatform] = useState(null);
  let [anim, setAnimComplete] = useState(false);
  let [categories, setCategories] = useState([]);
  let [colorPref, setColorPref] = useState(null);
  let [authState, setAuthState] = useState(`Next`);
  let [mobileMenu, setMobileMenu] = useState(false);
  let [emailField, setEmailField] = useState(false);
  let [systemStatus, setSystemStatus] = useState(``);
  let [showLeaders, setShowLeaders] = useState(false);
  let [content, setContent] = useState(`defaultContent`);
  let [year, setYear] = useState(new Date().getFullYear());

  let [user, setUser] = useState(null);
  let [users, setUsers] = useState([]);
  let [grids, setGrids] = useState([]);
  let [lists, setLists] = useState([]);
  let [items, setItems] = useState([]);
  let [board, setBoard] = useState({});
  let [emails, setEmails] = useState([]);
  let [boards, setBoards] = useState([]);
  let [profile, setProfile] = useState(null);
  let [profiles, setProfiles] = useState([]);
  let [userGrids, setUserGrids] = useState([]);
  let [selected, setSelected] = useState(null);
  let [userBoards, setUserBoards] = useState([]);
  let [usersGrids, setUsersGrids] = useState([]);
  let [alertOpen, setAlertOpen] = useState(false);
  let [rearranging, setRearranging] = useState(false);
  let [boardLoaded, setBoardLoaded] = useState(false);
  let [selectedGrid, setSelectedGrid] = useState(null);
  let [selectedGrids, setSelectedGrids] = useState([]);
  let [menuPosition, setMenuPosition] = useState(null);
  let [gridsLoading, setGridsLoading] = useState(true);
  let [usersLoading, setUsersLoading] = useState(true);
  let [activeOptions, setActiveOptions] = useState([]);
  let [emailsLoading, setEmailsLoading] = useState(true);
  let [boardsLoading, setBoardsLoading] = useState(true);
  let [tasksFiltered, setTasksFiltered] = useState(false);
  let [boardCategories, setBoardCategories] = useState([]);
  let [profilesLoading, setProfilesLoading] = useState(true);
  let [selectedGridData, setSelectedGridData] = useState(null);
  let [itemTypeMenuOpen, setItemTypeMenuOpen] = useState(false);
  let [completeFiltered, setCompleteFiltered] = useState(false);

  const getPageContainerClasses = () => {
    let route = rte == `_` ? `root` : rte;
    let pageName = isValid(page.toUpperCase()) ? page.toUpperCase() : `home_Page`;
    let userClasses = `${user != null ? `signed_in` : `signed_out`} ${usersLoading ? `users_loading` : `users_loaded`}`;
    let classes = `pageWrapContainer ${route} ${pageName} ${userClasses}`;
    return classes;
  }

  const resetGridsBoards = () => {
    setGrids([]);
    setBoards([]);
    setUserGrids([]);
    setUsersGrids([]);
    setSelectedGrids([]);
    setActiveOptions([]);
    setSelectedGrid(null);
    setGridsLoading(true);
    setBoardsLoading(true);
  }

  const signOutReset = async () => {
    await setUser(null);
    await setProfile(null);
    await setAuthState(AuthStates.Next);
    await setEmailField(false);
    await resetGridsBoards();
  }

  const onSignOut = async () => {
    try {
      await setUpdates(updates + 1);
      await signOutReset();
      await signOut(auth);
      router.replace(`/`, undefined, {
        shallow: true,
      });
    } catch (signOutError) {
      await logToast(`Error on Sign Out`, signOutError, true);
    }
  }

  const getGridsBoards = (activeGrds, brds) => {
    let gridsBoards = [];
    let gridsBoardsIDs = activeGrds?.length > 0 ? activeGrds.map(grd => grd?.data?.boardIDs).flat() : [];
    if (gridsBoardsIDs.length > 0) {
      gridsBoardsIDs.forEach(gbID => {
        let gBoard = brds.find(br => br?.id == gbID);
        if (gBoard) gridsBoards.push(gBoard);
      })
    }
    return gridsBoards;
  }

  const setUserData = (activeGridID, grds, brds) => {
    setGrids(grds);
    setUserBoards(brds);

    let lastSelectedGrid = grds.find(gr => gr?.id == activeGridID);
    let defaultSeletedGrid = lastSelectedGrid ? lastSelectedGrid : grds[0];
    
    let defaultSeletedGrids = [defaultSeletedGrid]?.map(gr => ({ ...gr, label: gr?.name, value: gr?.id }));
    let gridBoards = getGridsBoards(defaultSeletedGrids, brds);

    setSelectedGrids(defaultSeletedGrids);
    setGridsLoading(false);
 
    setBoards(gridBoards);
    setBoardsLoading(false);
  }
  
  const seedUserData = (usr, useDB = false) => {
    let { grids: grds, boards: brds, user: updatedUser } = generateSeedUserData(usr);
    
    if (useDB == false) {
      setGrids(grds);
      setUserBoards(brds);
    }

    let privatePersonalGrid = grds.find(gr => gr.type == GridTypes.Personal);
    let defaultSeletedGrid = privatePersonalGrid ? privatePersonalGrid : grds[0];
    
    let defaultSeletedGrids = [defaultSeletedGrid];
    let gridBoards = getGridsBoards(defaultSeletedGrids, brds);

    if (useDB == false) {
      setSelectedGrids(defaultSeletedGrids);
      setSelectedGrid(defaultSeletedGrid);
      setGridsLoading(false);
   
      setBoards(gridBoards);
      setBoardsLoading(false);
   
      if (user != null && updatedUser != null) {
        setUser(updatedUser);
      }
    } else {
      return {
        seeded_Grids: grds,
        seeded_Boards: brds,
        seeded_User: updatedUser,
      }
    }
  }

  const extractIDDetails = (ID) => {
    const regex = /^(.+?)_([^_]+)_(\d+)_([^_]+)_(\d+_\d+_[APM]+_\d+_\d+_\d+)_([^_]+)_(.+)$/;
    const match = ID.match(regex);
    if (match) {
      return {
        email: match[1],
        type: match[2],
        rank: parseInt(match[3], 10),
        name: match[4],
        created: match[5].replace(/_/g, ` `),
        uuid: match[6],
        uid: match[7],
      }
    }
  }

  const signInUser = (usr, navigateToLastSelectedGrid = false) => {
    setUser(usr);
    setAuthState(AuthStates.Sign_Out);

    if (navigateToLastSelectedGrid) {
      const urlId = `${usr?.rank}`;
      // const urlId = `${usr?.rank}-${usr?.name}-${usr?.uid}`;
      const userId = urlId || usr?.id;
      const gridId = usr?.lastSelectedGridID;
      let { rank } = extractIDDetails(gridId);
      // let { name, uuid } = extractIDDetails(gridId);
      let gridUrlId = `${rank}`;
      // let gridUrlId = `${rank}-${name}-${uuid}`;
      let userStartURL = `/user/${userId}/grids/${gridUrlId}`;
      router.replace(userStartURL, undefined, {
        shallow: true,
      });
    }
  }

  const onSignIn = async (email, password) => {
    signInWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
      if (userCredential != null) {
        let existingUser = users.find(eml => eml?.email?.toLowerCase() == email?.toLowerCase());
        if (existingUser) {
          signInUser(existingUser, true);
          toast.success(`Successfully Signed In`);
        } else {
          setEmailField(true);
          setAuthState(AuthStates.Sign_Up);
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

  useEffect(() => {
    if (selectedGridData?.selectedGrid && selectedGridData?.boards && selectedGridData?.lists && selectedGridData?.items && selectedGridData?.tasks) {
      dev() && console.log(`Selected Grid Data`, selectedGridData);
      let gridBoardsByID = selectedGridData?.selectedGrid?.data?.boardIDs?.map(bordID => {
        let gridBoard = selectedGridData?.boards?.find(brd => brd?.id == bordID);
        if (gridBoard) return new Board(gridBoard);
      })
      setBoards(gridBoardsByID);
      setBoardsLoading(false);
    }
  }, [selectedGridData]);

  useEffect(() => {
    let unsubscribeUserData = {};
    let listenforGridsDataChanges = null;
    if (selectedGrid != null) {
      setBoardsLoading(true);
      dev() && console.log(`Selected Grid`, selectedGrid);
      for (const collectionName of gridDataCollectionNames) {
        const gridData_Database = collection(db, collectionName);
        const gridDataQuery = query(gridData_Database, where(`gridID`, `==`, selectedGrid?.id));
        if (unsubscribeUserData[collectionName] == null) {
          unsubscribeUserData[collectionName] = onSnapshot(gridDataQuery, gridDataSnapshot => {
            const gridDataDocs = gridDataSnapshot.docs.map(doc => ({ ...doc.data() }));
            const formattedGridDataDocs = gridDataDocs?.sort((a, b) => a?.rank - b?.rank)?.map(doc => ({ ...doc, label: doc?.name, value: doc?.id }));
            const modeledGridDataDocs = formattedGridDataDocs?.map(doc => {
              if (doc?.type == Types.Board) {
                return new Board(doc);
              } else if (doc?.type == Types.List) {
                return new List(doc);
              } else if (doc?.type == Types.Item) {
                return new Item(doc);
              } else {
                return new Task(doc);
              }
            });
            setSelectedGridData(prevGridData => ({
              ...prevGridData,
              selectedGrid,
              [collectionName]: modeledGridDataDocs,
            }))
          });
        } else {
          setSelectedGridData(null);
          unsubscribeUserData[collectionName] = null;
        }
      }
    } else if (listenforGridsDataChanges != null) {
      if (listenforGridsDataChanges != null) listenforGridsDataChanges();
      if (Object.keys(unsubscribeUserData)?.length > 0) Object.values(unsubscribeUserData).forEach(unsubscribe => unsubscribe());
    };
    return () => {
      if (listenforGridsDataChanges != null) listenforGridsDataChanges();
      if (Object.keys(unsubscribeUserData)?.length > 0) Object.values(unsubscribeUserData).forEach(unsubscribe => unsubscribe());
    };
  }, [selectedGrid])

  const setUsersGridsState = (lastSelectedGridID, usersGridsByID, updateGrids = true) => {
    if (updateGrids == true) {
      setGrids(usersGridsByID);
      setUserGrids(usersGridsByID);
      setUsersGrids(usersGridsByID);
    }
    let lastSelectedGrid = usersGridsByID?.find(gr => gr?.id == lastSelectedGridID);
    if (lastSelectedGrid) {
      setSelectedGrid(lastSelectedGrid);
      setSelectedGrids([lastSelectedGrid]);
      setActiveOptions([lastSelectedGrid]);
    }
    setGridsLoading(false);
  }

  useEffect(() => {
    let listenforUserGridsChanges = null;
    if (user != null) {
      const gridsDatabase = collection(db, gridsTable)?.withConverter(gridConverter);
      const gridsQuery = query(gridsDatabase, where(`data.users`, `array-contains`, user?.email));
      if (listenforUserGridsChanges == null) listenforUserGridsChanges = onSnapshot(gridsQuery, gridsUpdates => {
        setGridsLoading(true);
        let userGridsFromDB = [];
        gridsUpdates.forEach((doc) => userGridsFromDB.push({ ...doc.data() }));
        userGridsFromDB = userGridsFromDB?.sort((a, b) => a?.rank - b?.rank)?.map(gr => new Grid({ ...gr, label: gr?.name, value: gr?.id }));
        let usersGridsByID = user?.data?.gridIDs.map(gridID => {
          let userGridByID = userGridsFromDB?.find(gr => gr?.id == gridID);
          if (userGridByID) return userGridByID;
        })
        if (id) {
          if (gridid) {
            if (usersGridsByID && usersGridsByID?.length > 0) {
              let thisGrid = usersGridsByID?.find(gr => String(gr?.rank) == String(gridid));
              if (thisGrid) {
                setUsersGridsState(thisGrid?.id, usersGridsByID);
              }
            }
          } else setUsersGridsState(user?.lastSelectedGridID, usersGridsByID);
        } else setUsersGridsState(user?.lastSelectedGridID, usersGridsByID);
        dev() && console.log(`Grids`, usersGridsByID);
      })
    } else if (listenforUserGridsChanges != null) listenforUserGridsChanges();
    return () => {if (listenforUserGridsChanges != null) listenforUserGridsChanges();};
  }, [user])

  useEffect(() => {
    let listenForUserAuthChanges = null;
    if (users?.length > 0) {
      if (listenForUserAuthChanges == null) listenForUserAuthChanges = onAuthStateChanged(auth, async (usr) => {
        if (usr) {
          if (usr?.uid) {
            let thisUser = users.find(us => us?.uid == usr?.uid);
            signInUser(thisUser);
          }
        }
      });
    } else if (listenForUserAuthChanges != null) listenForUserAuthChanges();
    return () => {if (listenForUserAuthChanges != null) listenForUserAuthChanges();};
  }, [users]);

  useEffect(() => {
    const usersDatabase = collection(db, usersTable)?.withConverter(userConverter);
    const usersDatabaseRealtimeListener = onSnapshot(usersDatabase, async usersUpdates => {
      // On Users Database Update
      setUsersLoading(true);
      let usersFromDB = [];
      usersUpdates.forEach((doc) => usersFromDB.push(new User({ ...doc.data() })));
      usersFromDB = usersFromDB?.sort((a, b) => a?.rank - b?.rank);
      setUsers(usersFromDB);
      if (user != null) {
        let thisUser = usersFromDB?.find(usr => usr?.uid == user?.uid);
        if (thisUser) signInUser(thisUser);
      }
      setUsersLoading(false);
      dev() && console.log(`Users`, usersFromDB);
      // Finish Users Database Update
    }, error => logToast(`Error on Get Users from Database`, error, true));
    return () => usersDatabaseRealtimeListener();
  }, [])
  
  useEffect(() => {
    setLoading(true);
    setAnimComplete(false);
    setSystemStatus(`Page Loading!`);

    if (loaded.current) return;

    loaded.current = true;
    localStorage.setItem(`alertOpen`, false);

    let storedTaskFilterPreference = null;
    let hasStoredTaskFilterPreference = localStorage.getItem(`tasksFiltered`);
    if (hasStoredTaskFilterPreference) storedTaskFilterPreference = JSON.parse(hasStoredTaskFilterPreference);
    if (storedTaskFilterPreference != null) setTasksFiltered(storedTaskFilterPreference);

    let cachedBoard = JSON.parse(localStorage.getItem(`board`));
    let cachedBoards = JSON.parse(localStorage.getItem(`boards`));

    setThemeUI();
    setDevEnv(dev());
    setUpdates(updates);
    setPlatform(navigator?.userAgent);
    setYear(new Date().getFullYear());
    setSystemStatus(`System Status Ok.`);
    setRte(replaceAll(router.route, `/`, `_`));
    setOnMac(navigator.platform.includes(`Mac`));
    setPage(window.location.pathname.replace(`/`,``));
    setLists(JSON.parse(localStorage.getItem(`lists`)) || defaultLists);
    setMobile((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1));

    if (cachedBoard) {
      if (!cachedBoard.name) cachedBoard.name = `Board`;
      if (!cachedBoard.created) cachedBoard.created = formatDate(new Date());
      if (!cachedBoard.updated) cachedBoard.updated = formatDate(new Date());
      if (!cachedBoard.id) cachedBoard.id = generateUniqueID(false, `board`);
      if (!cachedBoard.columns) cachedBoard.columns = initialBoardData.columns;
      if (!cachedBoard.columnOrder) cachedBoard.columnOrder = initialBoardData.columnOrder;
      if (!cachedBoard.items) cachedBoard.items = initialBoardData.items;
      setBoard(cachedBoard);
    } else {
      setBoard(initialBoardData);
    }

    if (cachedBoards && cachedBoards?.length > 0) {
      setBoards(cachedBoards);
    } else {
      signOutReset();
    }

    let toc = document.querySelector(`.nextra-toc`);
    let tocMinimized = JSON.parse(localStorage.getItem(`tocMinimized`));
    if (toc) {
      if (tocMinimized) {
        toc.classList.add(`minimized`);
      } else {
        toc.classList.remove(`minimized`);
      };
    }
      
    if (brwser == `` && (navigator.userAgent.match(/edg/i) || navigator.userAgent.includes(`edg`) || navigator.userAgent.includes(`Edg`))) {
      brwser = `edge`;
      setBrowser(`edge`);
    } if (brwser == `` && navigator.userAgent.match(/chrome|chromium|crios/i)) {
      brwser = `chrome`;
      setBrowser(`chrome`);
    } else if (brwser == `` && navigator.userAgent.match(/firefox|fxios/i)) {
      brwser = `firefox`;
      setBrowser(`firefox`);
    } else if (brwser == `` && navigator.userAgent.match(/safari/i)) {
      brwser = `safari`;
      setBrowser(`safari`);
    } else if (brwser == `` && navigator.userAgent.match(/opr\//i)) {
      brwser = `opera`;
      setBrowser(`opera`);
    }

    setLoading(false);
    setSystemStatus(`${getPage()} Loaded.`);
    setTimeout(() => setLoading(false), 1500);

    // if (dev()) {
    //   console.log(`brwser`, brwser);
    //   console.log(`App`, router.route);
    // }

    return () => {
    //   window.removeEventListener(`resize`, () => windowEvents());
    //   window.removeEventListener(`scroll`, () => windowEvents());
    }
  }, [rte, user, users, authState, dark])

  return (
    <StateContext.Provider value={{ 
      // Environment
      onMac, 
      router,
      rte, setRte, 
      year, setYear,
      page, setPage, 
      width, setWidth, 
      mobile, setMobile,
      devEnv, setDevEnv, 
      browser, setBrowser, 
      mobileMenuBreakPoint, 
      platform, setPlatform, 
      mobileMenu, setMobileMenu, 

      // Theme
      dark, setDark, 
      color, setColor, 
      colorPref, setColorPref, 

      // Users
      user, setUser, 
      users, setUsers, 
      emails, setEmails,
      profile, setProfile, 
      profiles, setProfiles,
      authState, setAuthState, 
      emailField, setEmailField, 
      usersLoading, setUsersLoading,
      emailsLoading, setEmailsLoading,
      profilesLoading, setProfilesLoading,

      // State
      IDs, setIDs, 
      qotd, setQotd, 
      focus, setFocus, 
      loading, setLoading, 
      content, setContent, 
      updates, setUpdates, 
      anim, setAnimComplete, 
      alertOpen, setAlertOpen, 
      highScore, setHighScore, 
      rearranging, setRearranging, 
      showLeaders, setShowLeaders, 
      systemStatus, setSystemStatus, 

      // Functions
      onSignIn,
      onSignOut,
      signInUser,
      setUserData,
      seedUserData,
      signOutReset,
      getGridsBoards,
      setUsersGridsState,

      // Grids & Boards
      menuRef, 
      grids, setGrids,
      lists, setLists, 
      items, setItems, 
      board, setBoard, 
      boards, setBoards, 
      selected, setSelected, 
      userGrids, setUserGrids,
      usersGrids, setUsersGrids,
      userBoards, setUserBoards,
      categories, setCategories, 
      boardLoaded, setBoardLoaded, 
      selectedGrid, setSelectedGrid,
      gridsLoading, setGridsLoading,
      menuPosition, setMenuPosition, 
      boardsLoading, setBoardsLoading,
      activeOptions, setActiveOptions,
      selectedGrids, setSelectedGrids,
      tasksFiltered, setTasksFiltered, 
      boardCategories, setBoardCategories, 
      selectedGridData, setSelectedGridData,
      completeFiltered, setCompleteFiltered, 
      itemTypeMenuOpen, setItemTypeMenuOpen, 
    }}>
      {(browser != `chrome` || onMac) ? (
        <AnimatePresence mode={`wait`}>
          <motion.div className={getPageContainerClasses()} key={router.route} initial="pageInitial" animate="pageAnimate" exit="pageExit" transition={{ duration: 0.35 }} variants={{
            pageInitial: {
              opacity: 0,
              clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
            },
            pageAnimate: {
              opacity: 1,
              clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
            },
            pageExit: {
              opacity: 0,
              clipPath: `polygon(50% 0, 50% 0, 50% 100%, 50% 100%)`,
            },
          }}>
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className={getPageContainerClasses()}>
          <Component {...pageProps} />
        </div>
      )}
      <ToastContainer
        draggable
        rtl={false}
        closeOnClick
        theme={`dark`}
        autoClose={3500}
        newestOnTop={false}
        pauseOnHover={false}
        position={`top-right`}
        hideProgressBar={false}
        pauseOnFocusLoss={false}
        style={{ marginTop: 55 }}
      />
      <ContextMenu menuRef={menuRef} menuPosition={menuPosition} />
    </StateContext.Provider>
  )
}