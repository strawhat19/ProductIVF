import '../main.scss';
import { createContext, useRef, useState, useEffect } from 'react';

export const StateContext = createContext({});

export default function MyApp({ Component, pageProps }) {
    let loaded = useRef(false);
    let mobileMenuBreakPoint = 697;
    let [page, setPage] = useState(``);
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
    let [highScore, setHighScore] = useState(0);
    let [platform, setPlatform] = useState(null);
    let [colorPref, setColorPref] = useState(user);
    let [authState, setAuthState] = useState(`Next`);
    let [mobileMenu, setMobileMenu] = useState(false);
    let [emailField, setEmailField] = useState(false);
    let [showLeaders, setShowLeaders] = useState(false);
    let [content, setContent] = useState(`defaultContent`);
    let [year, setYear] = useState(new Date().getFullYear());

    let [tasks, setTasks] = useState([
        {id: 1, task: `task 1`, complete: false}, 
        {id: 2, task: `task 2`, complete: true}, 
        {id: 3, task: `task 3`, complete: false}
    ]);

    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;
        let storedUser = JSON.parse(localStorage.getItem(`user`));
        setUpdates(updates);
        setPlatform(navigator?.userAgent);
        setYear(new Date().getFullYear());
        setPage(window.location.pathname.replace(`/`,``));
        setDevEnv(window.location.host.includes(`localhost`));
        setTasks([
            {id: 1, task: `task 1`, complete: false}, 
            {id: 2, task: `task 2`, complete: true}, 
            {id: 3, task: `task 3`, complete: false}
        ]);
    
        return () => {
        //   window.removeEventListener(`resize`, () => windowEvents());
        //   window.removeEventListener(`scroll`, () => windowEvents());
        }
      }, [user, users, authState, dark])

    return <StateContext.Provider value={{ tasks, setTasks, updates, setUpdates, content, setContent, width, setWidth, user, setUser, page, setPage, mobileMenu, setMobileMenu, users, setUsers, authState, setAuthState, emailField, setEmailField, devEnv, setDevEnv, mobileMenuBreakPoint, platform, setPlatform, focus, setFocus, highScore, setHighScore, color, setColor, dark, setDark, colorPref, setColorPref, lists, setLists, showLeaders, setShowLeaders, items, setItems }}><Component {...pageProps} /></StateContext.Provider>
}