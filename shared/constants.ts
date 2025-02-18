import { User } from './models/User';
import { Grid } from './models/Grid';
import { List } from './models/List';
import { Item } from './models/Item';
import { Task } from './models/Task';
import { Types } from './types/types';
import { Board } from './models/Board';
import { toast } from 'react-toastify';

export const userQueryFields = [`id`, `ID`, `uid`, `uuid`, `rank`, `name`, `role`, `email`, `image`, `avatar`, `phone`, `token`];

export const sortDescending = (arr: (string | number)[]): number[] => {
  return arr.map(item => (typeof item === `number` ? item : parseFloat(item))).filter(item => !isNaN(item)).sort((a, b) => b - a);
}

export const logToast = (message: string, content: any, error = false, data = null) => {
  let sendMsg = typeof content == `string` ? content : ``;
  console.log(message, content, data);
  if (error == false) {
    toast.success(message + ` ` + sendMsg);
  } else {
    toast.error(message + ` ` + sendMsg);
  }
}

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

export const nameFields = {
  board: { min: 1, max: 30 },
  column: { min: 1, max: 15 },
  item: { min: 1, max: 25 },
  task: { min: 1, max: 30 },
}

export const forceFieldBlurOnPressEnter = (e: any) => {
  if (e.key === `Enter`) {
    e.preventDefault();
    (e.target as any).blur();
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