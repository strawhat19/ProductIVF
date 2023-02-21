import '../main.scss';
import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useRef, useState, useEffect } from 'react';

export const StateContext = createContext({});

export const getPage = () => {
  return capitalizeAllWords(window.location.pathname.replace(`/`,``));
}

export const getCurrentPageName = () => {
  return window.location.hash.slice(window.location.hash.lastIndexOf(`/`)).replace(`/`, ``);
};

export const initialData = { items: {}, columns: {}, columnOrder: [] };

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

export const defaultContent = `Hey, I’m Rakib, a Software Engineer @ Mitsubishi Electric Trane HVAC US, or just Mitsubishi Electric for short. Along with my 7 years of experience as a developer, and owner of my own tech and digital media side business, Piratechs. This website is just for me to test out Next.js 13.`;

export const getNumberFromString = (string) => {
  let result = string.match(/\d+/);
  let number = parseInt(result[0]);
  return number;
}

export const createXML = (xmlString) => {
  let div = document.createElement('div');
  div.innerHTML = xmlString.trim();
  return div.firstChild;
}

export const capitalizeAllWords = (string) => {
  if (string != null || string != undefined) {
    return string.replace(`  `,` `).split(` `).map((word) => word?.charAt(0)?.toUpperCase() + word?.slice(1).toLowerCase()).join();
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

export const generateUniqueID = (existingIDs, name) => {
  let newID = Math.random().toString(36).substr(2, 9);
  if (existingIDs && existingIDs.length > 0) {
    while (existingIDs.includes(newID)) {
      newID = Math.random().toString(36).substr(2, 9);
    }
  }
  if (name) return `${name}_${formatDate(new Date())}_${newID}`.replace(/\s+/g, `_`).replace(/[:/]/g, `_`);
  return `${formatDate(new Date())}_${newID}`.replace(/\s+/g, `_`).replace(/[:/]/g, `_`);
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

export const formatDate = (date, specificPortion) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  let strTime = hours + ':' + minutes + ' ' + ampm;
  let completedDate = strTime + ` ` + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
  if (specificPortion == `time`) {
    completedDate = strTime;
  } else if (specificPortion == `date`) {
    completedDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
  } else {
    completedDate = strTime + ` ` + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
  }
  return completedDate;
};

export const defaultLists = [
  {id: `list_1_9_21_PM_2_17_2023_69zscemwk`, name: `ProductIVF Features`, created: formatDate(new Date()), items: [
    {id: `item_1_9_21_PM_2_17_2023_68yscemwk`, content: `Corner Draggable`, complete: false, created: formatDate(new Date())},
    {id: `item_2_9_22_PM_2_17_2023_r2epommeu`, content: `Switch to User`, complete: false, created: formatDate(new Date())},
  ]},
];

export const showAlert = async (alertTitle, alertMessage, additionalInfo) => {
  // if (alertOpen) return;
  // setAlertOpen(true);
  let alertDialog = document.createElement(`div`);
  alertDialog.className = `alert`;
  if ((!alertMessage && !additionalInfo) || (additionalInfo && additionalInfo?.length == 0)) alertDialog.classList.add(`slim`);
  alertDialog.innerHTML = `<h3>${alertTitle}</h3>
      ${alertMessage ? additionalInfo ? `` : alertMessage : ``}
  `;
  if (additionalInfo?.length > 0) {
    additionalInfo?.forEach((info, index) => {
        let element = createXML(`<p>${index+1}. ${alertMessage} ${info}</p>`);
        alertDialog.append(element);
    });
  }
  document.body.appendChild(alertDialog);
  let closeButton = document.createElement(`button`);
  closeButton.classList.add(`iconButton`);
  closeButton.classList.add(`alertButton`);
  closeButton.innerHTML = `X`;
  closeButton.onclick = () => {
    document.body.removeChild(alertDialog);
    // setAlertOpen(false);
  };
  alertDialog.appendChild(closeButton);
}

export default function MyApp({ Component, pageProps, router }) {
    let loaded = useRef(false);
    let mobileMenuBreakPoint = 697;
    let [IDs, setIDs] = useState([]);
    let [page, setPage] = useState(``);
    let [qotd, setQotd] = useState(``);
    let [width, setWidth] = useState(0);
    let [color, setColor] = useState(``);
    let [users, setUsers] = useState([]);
    let [user, setUser] = useState(null);
    let [lists, setLists] = useState([]);
    let [items, setItems] = useState([]);
    let [dark, setDark] = useState(false);
    let [height, setHeight] = useState(0);
    let [updates, setUpdates] = useState(0);
    let [focus, setFocus] = useState(false);
    let [devEnv, setDevEnv] = useState(false);
    let [mobile, setMobile] = useState(false);
    let [loading, setLoading] = useState(true);
    let [highScore, setHighScore] = useState(0);
    let [platform, setPlatform] = useState(null);
    let [anim, setAnimComplete] = useState(false);
    let [board, setBoard] = useState(initialData);
    let [colorPref, setColorPref] = useState(user);
    let [alertOpen, setAlertOpen] = useState(false);
    let [authState, setAuthState] = useState(`Next`);
    let [mobileMenu, setMobileMenu] = useState(false);
    let [emailField, setEmailField] = useState(false);
    let [systemStatus, setSystemStatus] = useState(``);
    let [boardLoaded, setBoardLoaded] = useState(false);
    let [showLeaders, setShowLeaders] = useState(false);
    let [content, setContent] = useState(`defaultContent`);
    let [animCompleted, setAnimCompleted] = useState(false);
    let [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
      setAnimComplete(false);
      setLoading(true);
      setSystemStatus(`Page Loading!`);
        if (loaded.current) return;
        loaded.current = true;
        let storedUser = JSON.parse(localStorage.getItem(`user`));
        setUpdates(updates);
        setPlatform(navigator?.userAgent);
        setYear(new Date().getFullYear());
        setSystemStatus(`System Status Ok.`);
        setPage(window.location.pathname.replace(`/`,``));
        setDevEnv(window.location.host.includes(`localhost`));
        setBoard(JSON.parse(localStorage.getItem(`board`)) || initialData);
        setLists(JSON.parse(localStorage.getItem(`lists`)) || defaultLists);
        setMobile((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1));

        let toc = document.querySelector(`.nextra-toc`);
        let tocMinimized = JSON.parse(localStorage.getItem(`tocMinimized`));
        if (tocMinimized) {
          toc.classList.add(`minimized`);
        } else {
          toc.classList.remove(`minimized`);
        };

        setLoading(false);
        setSystemStatus(`${getPage()} Loaded.`);
        setTimeout(() => setLoading(false), 1500);
        // setTimeout(() => setAnimComplete(true), 3500);
    
        return () => {
        //   window.removeEventListener(`resize`, () => windowEvents());
        //   window.removeEventListener(`scroll`, () => windowEvents());
        }
      }, [user, users, authState, dark])

    return <StateContext.Provider value={{ updates, setUpdates, content, setContent, width, setWidth, user, setUser, page, setPage, mobileMenu, setMobileMenu, users, setUsers, authState, setAuthState, emailField, setEmailField, devEnv, setDevEnv, mobileMenuBreakPoint, platform, setPlatform, focus, setFocus, highScore, setHighScore, color, setColor, dark, setDark, colorPref, setColorPref, lists, setLists, showLeaders, setShowLeaders, items, setItems, qotd, setQotd, alertOpen, setAlertOpen, mobile, setMobile, systemStatus, setSystemStatus, loading, setLoading, anim, setAnimComplete, IDs, setIDs, boardLoaded, setBoardLoaded, board, setBoard }}>
      <AnimatePresence exitBeforeEnter={true}>
        <motion.div className={`pageWrapContainer ${page.toUpperCase()}`} key={router.route} initial="pageInitial" animate="pageAnimate" exit="pageExit" transition={{ duration: 0.75 }} variants={{
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
    </StateContext.Provider>
}