import '../main.scss';
import { createContext, useRef, useState, useEffect } from 'react';

export const StateContext = createContext({});

export const getCurrentPageName = () => {
    return window.location.hash.slice(window.location.hash.lastIndexOf(`/`)).replace(`/`, ``);
  };
  
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
  
  export const generateUniqueID = (existingIDs) => {
    let newID = Math.random().toString(36).substr(2, 9);
    if (existingIDs && existingIDs.length > 0) {
      while (existingIDs.includes(newID)) {
        newID = Math.random().toString(36).substr(2, 9);
      }
    }
    return newID;
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
    {id: 1, name: `ProductIVF`, itemName: `Ticket`, items: [
      {id: `item-1`, content: `Draggable Lists`, complete: false},
      {id: `item-2`, content: `Complete Item in List`, complete: false},
      {id: `item-3`, content: `Icon in Tab`, complete: false},
      {id: `item-4`, content: `Update Lists on Reorder`, complete: false},
      {id: `item-5`, content: `Corner Draggable`, complete: false},
      {id: `item-6`, content: `Create List`, complete: false},
      {id: `item-7`, content: `localStorage if Signed Out`, complete: false},
      {id: `item-8`, content: `Switch to User`, complete: false},
      {id: `item-9`, content: `Save User List if Signed In`, complete: false},
      {id: `item-10`,  content: `Mobile Responsiveness`, complete: false},
    ]},
    {id: 2, name: `Tasks`, itemName: `Task`, items: [
      {id: `item-1`, content: `task 1`, complete: false}, 
      {id: `item-2`, content: `task 2`, complete: true}, 
      {id: `item-3`, content: `task 3`, complete: false}
    ]},
    {id: 3, name: `One Piece Strongest 2023`, itemName: `Character`, items: [
      {id: `item-1`, content: `Imu`, complete: false},
      {id: `item-2`, content: `Shanks`, complete: false},
      {id: `item-3`, content: `Dragon`, complete: false},
      {id: `item-4`, content: `Kaido`, complete: false},
      {id: `item-5`, content: `Mihawk`, complete: false},
    ]},
  ];

export default function MyApp({ Component, pageProps }) {
    let loaded = useRef(false);
    let mobileMenuBreakPoint = 697;
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
    let [colorPref, setColorPref] = useState(user);
    let [alertOpen, setAlertOpen] = useState(false);
    let [authState, setAuthState] = useState(`Next`);
    let [mobileMenu, setMobileMenu] = useState(false);
    let [emailField, setEmailField] = useState(false);
    let [systemStatus, setSystemStatus] = useState(``);
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
        setLists(JSON.parse(localStorage.getItem(`lists`)) || defaultLists);
        setMobile((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1));

        setLoading(false);
        setSystemStatus(`Page Loaded.`);
        setTimeout(() => setLoading(false), 1500);
        // setTimeout(() => setAnimComplete(true), 3500);
    
        return () => {
        //   window.removeEventListener(`resize`, () => windowEvents());
        //   window.removeEventListener(`scroll`, () => windowEvents());
        }
      }, [user, users, authState, dark])

    return <StateContext.Provider value={{ updates, setUpdates, content, setContent, width, setWidth, user, setUser, page, setPage, mobileMenu, setMobileMenu, users, setUsers, authState, setAuthState, emailField, setEmailField, devEnv, setDevEnv, mobileMenuBreakPoint, platform, setPlatform, focus, setFocus, highScore, setHighScore, color, setColor, dark, setDark, colorPref, setColorPref, lists, setLists, showLeaders, setShowLeaders, items, setItems, qotd, setQotd, alertOpen, setAlertOpen, mobile, setMobile, systemStatus, setSystemStatus, loading, setLoading, anim, setAnimComplete }}><Component {...pageProps} /></StateContext.Provider>
}