import { dev } from '../pages/_app';
import moment from 'moment-timezone';
import { User } from './models/User';
import { Grid } from './models/Grid';
import { List } from './models/List';
import { Item } from './models/Item';
import { Task } from './models/Task';
import { Types } from './types/types';
import { Board } from './models/Board';
import { toast } from 'react-toastify';

export const maxCredits = 20_000;
export const maxAuthAttempts = 5;
export const defaultAuthenticateLabel = `Delete User & All Data`;
export const userQueryFields = [`id`, `ID`, `uid`, `uuid`, `rank`, `name`, `role`, `email`, `image`, `avatar`, `phone`, `token`];

export const sortDescending = (arr: (string | number)[]): number[] => {
  return arr.map(item => (typeof item === `number` ? item : parseFloat(item))).filter(item => !isNaN(item)).sort((a, b) => b - a);
}

export const extractURLsFromText = (textArray: string[]) => {
  const URLRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.(com|net|org|io|co|gov|edu|us|uk|dev|app|info|biz|me|tv|xyz|ai|ca|in|nl|au|de)(?:[^\s]*)/gi;
  const URLsFromText = textArray.flatMap(text => text.match(URLRegex) || []);
  const lowerCasedURLsFromText = URLsFromText?.map(txt => txt?.toLowerCase());
  return lowerCasedURLsFromText;
}

export const extractRootDomain = (url: string, withPath = false) => {
  if (url) {
    const parsedUrl = new URL(url);
    const checkSlash = (string: string) => string != `/` ? string : ``;
    const hostnameParts = parsedUrl.hostname.split(`.`).filter(Boolean);
    const domain = hostnameParts.length >= 2 ? hostnameParts.slice(-2).join(`.`) : parsedUrl.hostname;
    return withPath ? `${domain}${checkSlash(parsedUrl.pathname)}${checkSlash(parsedUrl.search)}${checkSlash(parsedUrl.hash)}` : domain;
  }
}

// export const setItemURLs = (item: Item, textArrayOfFields: string[]) => {
//   let updatedURLs = item?.data?.relatedURLs;
//   let URLsFromText = extractURLsFromText(textArrayOfFields);
//   if (URLsFromText && URLsFromText?.length > 0) {
//     let lowerCasedCurrentURLs = item?.data?.relatedURLs?.map(txt => txt?.toLowerCase());
//     let newURLsFromText = URLsFromText.filter(url => !lowerCasedCurrentURLs?.includes(url));
//     if (newURLsFromText && newURLsFromText?.length > 0) {
//       updatedURLs = [ ...item?.data?.relatedURLs, ...newURLsFromText ];
//       item.data = {
//         ...item?.data,
//         relatedURLs: updatedURLs,
//       }
//     }
//   }
//   return item;
// }

export const removeExtraSpacesFromString = (string: string) => string.trim().replace(/\s+/g, ` `);
export const generateArray = (length: number, itemData: any) => Array.from({ length }, () => itemData);
export const stringMatch = (string: string, check: string): boolean => string?.toLowerCase()?.includes(check?.toLowerCase());
export const stringNoSpaces = (string: string) => string?.replaceAll(/[\s,:/]/g, `_`)?.replaceAll(/[\s,:/]/g, `-`).replaceAll(/-/g, `_`);

export const extractRankFromDocId = (doc_id: string, doc_email: string, doc_type: Types) => {
  let fromFirstNumberInId = doc_id?.split(`${doc_email}_${doc_type}_`)[1];
  let rank = fromFirstNumberInId?.split(`_`)[0];
  return parseFloat(rank);
}

export const extractRankFromDoc = (doc: Partial<User> | Partial<Grid> | Partial<Board> | Partial<List> | Partial<Item> | Partial<Task>) => {
  let fromFirstNumberInId = doc?.id?.split(`${doc?.email}_${doc?.type}_`)[1];
  let rank = fromFirstNumberInId?.split(`_`)[0];
  return parseFloat(rank);
}

export const momentFormats = {
  default: `h:mm A M/D/YYYY`,
  wSeconds: `h:mm:ss A M/D/YYYY`,
}

export const nameFields = {
  grid: { min: 1, max: 10 },
  board: { min: 1, max: 30 },
  column: { min: 1, max: 15 },
  list: { min: 1, max: 15 },
  item: { min: 1, max: 25 },
  task: { min: 1, max: 30 },
}

export const fontAwesomeIcons = {
  inbox: `fas fa-inbox`,
  folder: `fas fa-folder`,
  archive: `fas fa-archive`,
}

export const forceFieldBlurOnPressEnter = (e: any) => {
  if (e.key === `Enter`) {
    e.preventDefault();
    (e.target as any).blur();
  }
}

export const logToast = (message: string, content: any, error = false, data = null) => {
  let sendMsg = typeof content == `string` ? content : ``;
  if (dev()) {
    if (data != null) console.log(message, content, data);
    else console.log(message, content);
  }
  if (error == false) {
    toast.success(message + ` ` + sendMsg);
  } else {
    toast.error(message + ` ` + sendMsg);
  }
}

export const removeNullAndUndefinedProperties = (object) => {
  return Object.entries(object).reduce((accumulator, [key, value]) => {
    if (value !== null && value !== undefined) {
      accumulator[key] = value;
    }
    return accumulator;
  }, {});
}

export const combineArraysByKey = <T>(data: T[], key: keyof T): any[] => {
  return data.reduce((combined, item) => {
    const arrayToCombine = item[key];
    if (Array.isArray(arrayToCombine)) {
      return combined.concat(arrayToCombine);
    }
    return combined;
  }, [] as any[]);
}

export const withinXTime = (formattedDate: string, time: number, interval = `hours`) => {
  const nowMoment = moment();
  const xMoment = moment()?.subtract(time, interval as any);
  const dateMoment = moment(new Date(Date.parse(formattedDate)));
  const dateWithinTime = dateMoment?.isBetween(xMoment, nowMoment);
  return dateWithinTime;
}

export const withinXHours = (hours: number, formattedDate: string) => {
  const currentTime = new Date();
  const parsedDate = new Date(Date.parse(formattedDate));
  const timeDifference = Math.abs(currentTime.getTime() - parsedDate.getTime());
  const hourDifference = timeDifference / (1000 * 60 * 60);
  const isWithinXHours = hourDifference <= hours;
  return isWithinXHours;
}

export const findHighestNumberInArrayByKey = async ( arrayOfObjects: any[], key: string ): Promise<number | null> => {
  try {
    const filteredNumbers = arrayOfObjects
      .map(obj => obj[key])
      .filter(value => typeof value === `number`);
    if (filteredNumbers.length === 0) return 0;
    const highestNumber = Math.max(...filteredNumbers);
    return highestNumber;
  } catch (error) {
    console.log(`Error while finding the highest number for key "${key}"`, error);
    return 0;
  }
}

export const setMaxLengthOnField = (e: any, maxLength) => {
  const target = e.target as HTMLSpanElement;
  if (target.innerText.length > maxLength) {
    target.innerText = target.innerText.substring(0, maxLength);
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(target);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}

export const isValid = (item) => {
  if (typeof item == `string`) {
    let isInvalidString = !item || item == `` || item.trim() == `` || item == undefined || item == null;
    return !isInvalidString;
  } else if (typeof item == `number`) {
    let isInvalidNumber = isNaN(item) || item == undefined || item == null;
    return !isInvalidNumber;
  } else if (typeof item == `object` && item != undefined && item != null) {
    let isInvalidObject = Object.keys(item).length == 0 || item == undefined || item == null;
    return !isInvalidObject;
  } else {
    let isUndefined = item == undefined || item == null;
    return !isUndefined;
  }
}

export const formatDateNoSpaces = (date: any = new Date()) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? `PM` : `AM`;
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? `0` + minutes : minutes;
  let strTime = hours + `:` + minutes + ` ` + ampm;
  let strTimeNoSpaces = hours + `-` + minutes + `-` + ampm;
  let completedDate = strTime + ` ` + (date.getMonth() + 1) + `/` + date.getDate() + `/` + date.getFullYear();
  completedDate = strTimeNoSpaces + `_` + (date.getMonth() + 1) + `-` + date.getDate() + `-` + date.getFullYear();
  return completedDate;
}

export const countPropertiesInObject = (obj) => {
  let count = 0;
  if (typeof obj === `object` && obj !== null) {
    for (const key in obj) {
      count++;
      count += countPropertiesInObject(obj[key]);
    }
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        count += countPropertiesInObject(item);
      });
    }
  }
  return count;
}

export const getRankAndNumber = async (type: Types, docs: any[], docIDs: string[], users, user, IDs?) => {
  let docsLn = docs?.length;
  let docsRank = (docsLn > 0 && docs[0]?.rank) ? await findHighestNumberInArrayByKey(docs, `rank`) : 0;
  let docsNumber = (docsLn > 0 && docs[0]?.number) ? await findHighestNumberInArrayByKey(docs, `number`) : 0;

  let userDocsLength = docIDs?.length;
  let docsIDX = docsRank > docsLn ? docsRank : docsLn;
  let docsRanks = docIDs?.map(dcID => extractRankFromDocId(dcID, user?.email, type));

  let allDocsRanks = [];
  
  if (users && users?.length > 0) {
    users.forEach(usr => {
      if (!IDs) IDs = usr?.data?.[`${type?.toLowerCase()}IDs`];
      let usrDocsRanks = IDs?.map(dcID => extractRankFromDocId(dcID, usr?.email, type));
      usrDocsRanks?.forEach(dcRank => allDocsRanks?.push(dcRank));
    })
    allDocsRanks = sortDescending(allDocsRanks);
  }

  let allDocsRanksLn = allDocsRanks?.length;
  
  let allRanks = [docsIDX, userDocsLength, docsNumber, ...docsRanks];
  let maxRank = sortDescending(allRanks)[0];
  
  let rank = maxRank + 1;
  let number = allDocsRanksLn + 1;

  number = number > rank ? number : rank;

  return {
    rank,
    number,
  }
}