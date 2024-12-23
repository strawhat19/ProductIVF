import '../main.scss';
import 'react-toastify/dist/ReactToastify.css';

import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useRef, useState, useEffect } from 'react';

export const StateContext = createContext({});

export const getPage = () => {
  return capitalizeAllWords(window.location.pathname.replace(`/`,``));
}

export const getCurrentPageName = () => {
  return window.location.hash.slice(window.location.hash.lastIndexOf(`/`)).replace(`/`, ``);
};

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

export const generateUniqueID = (existingIDs, name) => {

  let newID = Math.random().toString(36).substr(2, 9);
  if (existingIDs && existingIDs.length > 0) {
    while (existingIDs.includes(newID)) {
      newID = Math.random().toString(36).substr(2, 9);
    }
  }

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

export const defaultBoards = [{
  "items": [
    {
      "id": "item_1_2_20_AM_2_21_2023_5vfc49t8p",
      "complete": false,
      "type": "To Do",
      "content": "Ayooo",
      "created": "2:20 AM 2/21/2023",
      "updated": "2:20 AM 2/21/2023"
    },
    {
      "id": "item_7_2_20_AM_2_21_2023_hmhsll51c",
      "complete": true,
      "type": "To Do",
      "content": "Whaddup",
      "created": "2:20 AM 2/21/2023",
      "updated": "2:20 AM 2/21/2023"
    },
    {
      "id": "item_2_2_24_AM_2_21_2023_v7vdvq7xb",
      "complete": false,
      "type": "To Do",
      "content": "Test Item",
      "created": "2:24 AM 2/21/2023",
      "updated": "7:12 PM 2/21/2023"
    },
    {
      "id": "item_1_2_47_AM_2_21_2023_ufobm8gds",
      "complete": true,
      "type": "Active",
      "content": "Detect Categories",
      "created": "2:47 AM 2/21/2023",
      "updated": "7:12 PM 2/21"
    },
    {
      "id": "item_1_1_06_AM_2_21_2023_puvkbf5jt",
      "complete": true,
      "type": "Completed",
      "content": "AdHoc Bug Fixes",
      "created": "1:06 AM 2/21/2023",
      "updated": "2:19 AM 2/21/2023"
    },
    {
      "id": "item_2_1_07_AM_2_21_2023_qmpi9w53n",
      "complete": true,
      "type": "Completed",
      "content": "Deploy New Code Changes",
      "created": "1:07 AM 2/21/2023",
      "updated": "1:46 AM 2/21/2023"
    },
    {
      "id": "item_2_1_07_AM_2_21_2023_x1qs0ba58",
      "complete": true,
      "type": "Completed",
      "content": "Release 1.5",
      "created": "1:07 AM 2/21/2023",
      "updated": "1:45 AM 2/21/2023"
    },
    {
      "id": "item_2_1_07_AM_2_21_2023_cod2k6ysu",
      "complete": true,
      "type": "Completed",
      "content": "Fix Notification Bugs",
      "created": "1:07 AM 2/21/2023",
      "updated": "1:07 AM 2/21/2023"
    },
    {
      "id": "item_2_1_08_AM_2_21_2023_cph525xnf",
      "complete": true,
      "type": "Completed",
      "content": "Refine Items In Board",
      "created": "1:08 AM 2/21/2023",
      "updated": "2:20 AM 2/21/2023"
    },
    {
      "id": "item_2_1_46_AM_2_21_2023_vqp5ysdv4",
      "complete": true,
      "type": "Completed",
      "content": "Filter Completed",
      "created": "1:46 AM 2/21/2023",
      "updated": "1:46 AM 2/21/2023"
    }
  ],
  "columns": [
    {
      "id": "col-1",
      "name": "To Do",
      "type": "To Do",
      "created": "1:59 AM 2/23/2023",
      "rows": [
        {
          "id": "item_1_2_20_AM_2_21_2023_5vfc49t8p",
          "complete": false,
          "type": "To Do",
          "content": "Ayooo",
          "created": "2:20 AM 2/21/2023",
          "updated": "2:20 AM 2/21/2023"
        },
        {
          "id": "item_7_2_20_AM_2_21_2023_hmhsll51c",
          "complete": true,
          "type": "To Do",
          "content": "Whaddup",
          "created": "2:20 AM 2/21/2023",
          "updated": "2:20 AM 2/21/2023"
        },
        {
          "id": "item_2_2_24_AM_2_21_2023_v7vdvq7xb",
          "complete": false,
          "type": "To Do",
          "content": "Test Item",
          "created": "2:24 AM 2/21/2023",
          "updated": "7:12 PM 2/21/2023"
        }
      ]
    },
    {
      "id": "col-2",
      "name": "In Progress",
      "type": "Active",
      "created": "1:59 AM 2/23/2023",
      "rows": [
        {
          "id": "item_1_2_47_AM_2_21_2023_ufobm8gds",
          "complete": true,
          "type": "Active",
          "content": "Detect Categories",
          "created": "2:47 AM 2/21/2023",
          "updated": "7:12 PM 2/21"
        }
      ]
    },
    {
      "id": "col-3",
      "name": "Completed",
      "type": "Complete",
      "created": "1:59 AM 2/23/2023",
      "rows": [
        {
          "id": "item_1_1_06_AM_2_21_2023_puvkbf5jt",
          "complete": true,
          "type": "Completed",
          "content": "AdHoc Bug Fixes",
          "created": "1:06 AM 2/21/2023",
          "updated": "2:19 AM 2/21/2023"
        },
        {
          "id": "item_2_1_07_AM_2_21_2023_qmpi9w53n",
          "complete": true,
          "type": "Completed",
          "content": "Deploy New Code Changes",
          "created": "1:07 AM 2/21/2023",
          "updated": "1:46 AM 2/21/2023"
        },
        {
          "id": "item_2_1_07_AM_2_21_2023_x1qs0ba58",
          "complete": true,
          "type": "Completed",
          "content": "Release 1.5",
          "created": "1:07 AM 2/21/2023",
          "updated": "1:45 AM 2/21/2023"
        },
        {
          "id": "item_2_1_07_AM_2_21_2023_cod2k6ysu",
          "complete": true,
          "type": "Completed",
          "content": "Fix Notification Bugs",
          "created": "1:07 AM 2/21/2023",
          "updated": "1:07 AM 2/21/2023"
        },
        {
          "id": "item_2_1_08_AM_2_21_2023_cph525xnf",
          "complete": true,
          "type": "Completed",
          "content": "Refine Items In Board",
          "created": "1:08 AM 2/21/2023",
          "updated": "2:20 AM 2/21/2023"
        },
        {
          "id": "item_2_1_46_AM_2_21_2023_vqp5ysdv4",
          "complete": true,
          "type": "Completed",
          "content": "Filter Completed",
          "created": "1:46 AM 2/21/2023",
          "updated": "1:46 AM 2/21/2023"
        }
      ]
    }
  ],
  "created": "1:59 AM 2/23/2023",
  "type": "Kanban",
  "name": "Kan",
  "id": "board_1_1_59_AM_2_23_2023_da2xnq26s"
}];

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

export const buggedBoards = [
  {
    "created": "11:08 PM 3/3/2023",
    "name": "Kanban Board",
    "columnOrder": [
      "list_1_11_08_PM_3_3_2023_lzuk8f724",
      "list_2_11_08_PM_3_3_2023_qf2w88ika"
    ],
    "id": "board_2_11_08_PM_3_3_2023_edgjqnxjw",
    "columns": {
      "list_1_11_08_PM_3_3_2023_lzuk8f724": {
        "id": "list_1_11_08_PM_3_3_2023_lzuk8f724",
        "title": "active",
        "itemIds": [
          "item_2_11_18_PM_3_3_2023_xb8prsifv",
          "item_1_11_08_PM_3_3_2023_x19mqvl4o"
        ]
      },
      "list_2_11_08_PM_3_3_2023_qf2w88ika": {
        "id": "list_2_11_08_PM_3_3_2023_qf2w88ika",
        "title": "complete",
        "itemIds": [
          "item_2_11_08_PM_3_3_2023_h4zz5zgng",
          "item_1_11_08_PM_3_3_2023_ydbu61kpi"
        ]
      }
    },
    "titleWidth": "189px",
    "items": {
      "item_1_11_08_PM_3_3_2023_x19mqvl4o": {
        "id": "item_1_11_08_PM_3_3_2023_x19mqvl4o",
        "subtasks": [],
        "complete": false,
        "created": "11:08 PM 3/3/2023",
        "content": "Item To Do Next",
        "updated": "11:19 PM 3/3/2023"
      },
      "item_1_11_08_PM_3_3_2023_ydbu61kpi": {
        "id": "item_1_11_08_PM_3_3_2023_ydbu61kpi",
        "subtasks": [],
        "complete": true,
        "created": "11:08 PM 3/3/2023",
        "content": "Completed Item",
        "updated": "11:18 PM 3/3/2023"
      },
      "item_2_11_08_PM_3_3_2023_h4zz5zgng": {
        "id": "item_2_11_08_PM_3_3_2023_h4zz5zgng",
        "subtasks": [
          {
            "id": "subtask_2_11_09_PM_3_3_2023_lwxx3a24e",
            "complete": true,
            "task": "First",
            "created": "11:09 PM 3/3/2023",
            "updated": "11:18 PM 3/3/2023"
          },
          {
            "id": "subtask_1_11_09_PM_3_3_2023_qqy50c2l0",
            "complete": true,
            "task": "Second",
            "created": "11:09 PM 3/3/2023",
            "updated": "11:18 PM 3/3/2023"
          }
        ],
        "complete": true,
        "created": "11:08 PM 3/3/2023",
        "content": "Completed Item With Subtasks",
        "updated": "11:18 PM 3/3/2023"
      },
      "item_2_11_18_PM_3_3_2023_xb8prsifv": {
        "id": "item_2_11_18_PM_3_3_2023_xb8prsifv",
        "subtasks": [
          {
            "id": "subtask_1_11_18_PM_3_3_2023_010ml2hld",
            "complete": true,
            "task": "Sub Task One",
            "created": "11:18 PM 3/3/2023",
            "updated": "11:18 PM 3/3/2023"
          },
          {
            "id": "subtask_2_11_18_PM_3_3_2023_s2le1q945",
            "complete": false,
            "task": "Sub Task Two",
            "created": "11:18 PM 3/3/2023"
          },
          {
            "id": "subtask_3_11_18_PM_3_3_2023_nb3x84xoa",
            "complete": false,
            "task": "Sub Task Three",
            "created": "11:18 PM 3/3/2023"
          }
        ],
        "complete": false,
        "created": "11:18 PM 3/3/2023",
        "content": "Item W/ Subtasks",
        "updated": "11:18 PM 3/3/2023"
      }
    },
    "updated": "11:20 PM 3/3/2023",
    expanded: true,
  }
];

export const showAlert = async (title, component, width, height) => {
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
    let loaded = useRef(false);
    let mobileMenuBreakPoint = 697;
    let [IDs, setIDs] = useState([]);
    let [rte, setRte] = useState(``);
    let [page, setPage] = useState(``);
    let [qotd, setQotd] = useState(``);
    let [width, setWidth] = useState(0);
    let [color, setColor] = useState(``);
    let [users, setUsers] = useState([]);
    let [user, setUser] = useState(null);
    let [lists, setLists] = useState([]);
    let [items, setItems] = useState([]);
    let [board, setBoard] = useState({});
    let [dark, setDark] = useState(false);
    let [boards, setBoards] = useState([]);
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
    let [colorPref, setColorPref] = useState(user);
    let [alertOpen, setAlertOpen] = useState(false);
    let [authState, setAuthState] = useState(`Next`);
    let [mobileMenu, setMobileMenu] = useState(false);
    let [emailField, setEmailField] = useState(false);
    let [systemStatus, setSystemStatus] = useState(``);
    let [rearranging, setRearranging] = useState(false);
    let [boardLoaded, setBoardLoaded] = useState(false);
    let [showLeaders, setShowLeaders] = useState(false);
    let [content, setContent] = useState(`defaultContent`);
    let [tasksFiltered, setTasksFiltered] = useState(false);
    let [boardCategories, setBoardCategories] = useState([]);
    let [year, setYear] = useState(new Date().getFullYear());
    let [completeFiltered, setCompleteFiltered] = useState(false);

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

      // let storedUser = JSON.parse(localStorage.getItem(`user`));
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
        if (!cachedBoard.created) cachedBoard.created = formatDate(new Date());
        if (!cachedBoard.updated) cachedBoard.updated = formatDate(new Date());
        if (!cachedBoard.id) cachedBoard.id = generateUniqueID(false, `board`);
        if (!cachedBoard.name) cachedBoard.name = `Board`;
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
        setBoards([{"created":"6:03 PM 5/27/2023","expanded":true,"name":"Try Dragging Me","columnOrder":["column_1_6_03_PM_5_27_2023_vua19vc5d","column_2_6_03_PM_5_27_2023_z6mtlms7c"],"columns":{"column_1_6_03_PM_5_27_2023_vua19vc5d":{"id":"column_1_6_03_PM_5_27_2023_vua19vc5d","title":"active","itemIds":["item_3_6_13_PM_5_27_2023_27vnmb2j2","item_3_6_15_PM_5_27_2023_lvza6sitz"],"itemType":"Item"},"column_2_6_03_PM_5_27_2023_z6mtlms7c":{"id":"column_2_6_03_PM_5_27_2023_z6mtlms7c","title":"complete","itemIds":["item_3_6_13_PM_5_27_2023_942tumtrc","item_1_6_08_PM_5_27_2023_s2egf8yu6","item_1_6_06_PM_5_27_2023_gqfn5z8cr"],"itemType":"Image"}},"id":"board_1_6_03_PM_5_27_2023_q1nmnvrpp","titleWidth":"207.5px","items":{"item_1_6_06_PM_5_27_2023_gqfn5z8cr":{"image":"","video":"","id":"item_1_6_06_PM_5_27_2023_gqfn5z8cr","subtasks":[{"id":"subtask_1_6_06_PM_5_27_2023_20jn2tf20","complete":true,"task":"Netflix","created":"6:06 PM 5/27/2023","updated":"6:08 PM 5/27/2023"},{"id":"subtask_4_6_06_PM_5_27_2023_fslx5f05w","complete":true,"task":"Car","created":"6:06 PM 5/27/2023","updated":"6:08 PM 5/27/2023"},{"id":"subtask_5_6_06_PM_5_27_2023_b7ji8l1se","complete":true,"task":"House","created":"6:06 PM 5/27/2023","updated":"6:08 PM 5/27/2023"}],"complete":true,"type":"Task","created":"6:06 PM 5/27/2023","content":"Pay Bills","updated":"6:08 PM 5/27/2023"},"item_1_6_08_PM_5_27_2023_s2egf8yu6":{"image":"","video":"","id":"item_1_6_08_PM_5_27_2023_s2egf8yu6","subtasks":[],"complete":true,"type":"Item","created":"6:08 PM 5/27/2023","content":"Testing New Board","updated":"6:08 PM 5/27/2023"},"item_3_6_13_PM_5_27_2023_942tumtrc":{"image":"","video":"","id":"item_3_6_13_PM_5_27_2023_942tumtrc","subtasks":[{"id":"subtask_1_6_13_PM_5_27_2023_w3ddkmv48","complete":false,"task":"Sub Task One","created":"6:13 PM 5/27/2023"},{"id":"subtask_2_6_17_PM_5_27_2023_3970zp8nd","complete":true,"task":"Completed Subtask","created":"6:17 PM 5/27/2023","updated":"6:17 PM 5/27/2023"}],"complete":false,"type":"Task","created":"6:13 PM 5/27/2023","content":"Create Subtasks","updated":"6:17 PM 5/27/2023"},"item_3_6_13_PM_5_27_2023_27vnmb2j2":{"image":"","video":"","id":"item_3_6_13_PM_5_27_2023_27vnmb2j2","subtasks":[],"complete":false,"type":"Item","created":"6:13 PM 5/27/2023","content":"Try Dragging Me","updated":"6:17 PM 5/27/2023"},"item_3_6_15_PM_5_27_2023_lvza6sitz":{"image":"https://user-images.githubusercontent.com/2182637/53614150-efbed780-3c2c-11e9-9204-a5d2e746faca.gif","video":"","id":"item_3_6_15_PM_5_27_2023_lvza6sitz","subtasks":[],"complete":false,"type":"Image","created":"6:15 PM 5/27/2023","content":"Or Add An Image","updated":"6:17 PM 5/27/2023"}},"updated":"6:17 PM 5/27/2023"},{"created":"6:09 PM 5/27/2023","expanded":true,"name":"Another Board To Drag","columnOrder":["column_1_6_09_PM_5_27_2023_zpcan4deb","list_3_6_10_PM_5_27_2023_wlcimzlua"],"columns":{"column_1_6_09_PM_5_27_2023_zpcan4deb":{"id":"column_1_6_09_PM_5_27_2023_zpcan4deb","title":"You Can Drag Columns","itemIds":["item_1_6_11_PM_5_27_2023_y2vtop14o","item_2_6_18_PM_5_27_2023_n458lp2jj","item_3_6_19_PM_5_27_2023_58qpoeyi0"],"itemType":"Item","updated":"6:10 PM 5/27/2023"},"list_3_6_10_PM_5_27_2023_wlcimzlua":{"id":"list_3_6_10_PM_5_27_2023_wlcimzlua","title":"And Make New Ones","itemIds":["item_2_6_14_PM_5_27_2023_wie8q2ts3","item_2_6_18_PM_5_27_2023_cl6xfeisp","item_3_6_19_PM_5_27_2023_jx025dtp9"],"itemType":"Item","updated":"6:15 PM 5/27/2023"}},"id":"board_2_6_09_PM_5_27_2023_op1nautzv","titleWidth":"258.5px","items":{"item_1_6_11_PM_5_27_2023_y2vtop14o":{"image":"","video":"","id":"item_1_6_11_PM_5_27_2023_y2vtop14o","subtasks":[],"complete":true,"type":"Item","created":"6:11 PM 5/27/2023","content":"You Can Have Completed Items In Any Column","updated":"6:14 PM 5/27/2023"},"item_2_6_14_PM_5_27_2023_wie8q2ts3":{"image":"","video":"","id":"item_2_6_14_PM_5_27_2023_wie8q2ts3","subtasks":[],"complete":false,"type":"Item","created":"6:14 PM 5/27/2023","content":"Click Me To Manage An Item Or To Rename","updated":"6:14 PM 5/27/2023"},"item_2_6_18_PM_5_27_2023_n458lp2jj":{"image":"","video":"","id":"item_2_6_18_PM_5_27_2023_n458lp2jj","subtasks":[],"complete":false,"type":"Item","created":"6:18 PM 5/27/2023","content":"You Can Manage Tasks Or Create Lists In Any Order You Prefer!"},"item_2_6_18_PM_5_27_2023_cl6xfeisp":{"image":"","video":"","id":"item_2_6_18_PM_5_27_2023_cl6xfeisp","subtasks":[],"complete":false,"type":"Image","created":"6:18 PM 5/27/2023","content":"You Can Click A Board To Expand That Board Or Focus On It"},"item_3_6_19_PM_5_27_2023_jx025dtp9":{"image":"","video":"","id":"item_3_6_19_PM_5_27_2023_jx025dtp9","subtasks":[],"complete":false,"type":"Item","created":"6:19 PM 5/27/2023","content":"Also You Can Click To Collapse A Board Entirely Until You Are Ready To Open It Back Up Again"},"item_3_6_19_PM_5_27_2023_58qpoeyi0":{"image":"","video":"","id":"item_3_6_19_PM_5_27_2023_58qpoeyi0","subtasks":[],"complete":false,"type":"Item","created":"6:19 PM 5/27/2023","content":"Create Rankings And Reorder Them With Dynamic Sorting Indexes"}},"updated":"6:19 PM 5/27/2023"}]);
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

    return <StateContext.Provider value={{ router, rte, setRte, updates, setUpdates, content, setContent, width, setWidth, user, setUser, page, setPage, mobileMenu, setMobileMenu, users, setUsers, authState, setAuthState, emailField, setEmailField, devEnv, setDevEnv, mobileMenuBreakPoint, platform, setPlatform, focus, setFocus, highScore, setHighScore, color, setColor, dark, setDark, colorPref, setColorPref, lists, setLists, showLeaders, setShowLeaders, items, setItems, qotd, setQotd, alertOpen, setAlertOpen, mobile, setMobile, systemStatus, setSystemStatus, loading, setLoading, anim, setAnimComplete, IDs, setIDs, boardLoaded, setBoardLoaded, board, setBoard, completeFiltered, setCompleteFiltered, boardCategories, setBoardCategories, categories, setCategories, boards, setBoards, browser, setBrowser, onMac, rearranging, setRearranging, tasksFiltered, setTasksFiltered }}>
      {(browser != `chrome` || onMac) ? <AnimatePresence mode={`wait`}>
        <motion.div className={`${rte} pageWrapContainer ${page.toUpperCase()}`} key={router.route} initial="pageInitial" animate="pageAnimate" exit="pageExit" transition={{ duration: 0.35 }} variants={{
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
      </AnimatePresence> : <div className={`pageWrapContainer ${page.toUpperCase()}`}>
        <Component {...pageProps} />
      </div>}
      <ToastContainer
        position={`bottom-left`}
        hideProgressBar={false}
        pauseOnHover={false}
        newestOnTop={false}
        autoClose={3500}
        pauseOnFocusLoss
        theme={`dark`}
        closeOnClick
        rtl={false}
        draggable
      />
    </StateContext.Provider>
}