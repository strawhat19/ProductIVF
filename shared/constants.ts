export const removeExtraSpacesFromString = (string: string) => string.trim().replace(/\s+/g, ` `);
export const stringNoSpaces = (string: string) => string?.replaceAll(/[\s,:/]/g, `_`)?.replaceAll(/[\s,:/]/g, `-`).replaceAll(/-/g, `_`);

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