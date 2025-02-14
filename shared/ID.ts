import { Types } from './types/types';
import { formatDate } from '../pages/_app';
import { stringNoSpaces } from './constants';

export const generateUniqueIDwDate = (date, position, type, uuid) => {
  let newID = uuid || generateID();
  let dateNoSpaces = formatDate(date);
  let uniqueID = `${position}_${type}_${dateNoSpaces}_${newID}`;
  let uniqueIDFormatted = uniqueID?.replace(/\s+/g, `_`).replace(/[:/]/g, `_`);
  return uniqueIDFormatted;
};

export const generateID = () => {
  let id = Math.random().toString(36).substr(2, 9);
  return Array.from(id).map(char => {
    return Math.random() > 0.5 ? char.toUpperCase() : char;
  }).join(``);
}

export class ID {
  id: any;
  ID: any;
  type: Types;
  position: number;
  date: Date | string;
  uuid: string | number | any;
  title: string | number | any;
  id_Title: string | number | any;
  currentDateTimeStampNoSpaces: string;
  constructor(data: Partial<ID>) {
    Object.assign(this, data);
  }
}

export const getIDParts = () => {
  let uuid = generateID();
  let date = formatDate(new Date());
  return { uuid, date };
}

export const genID = (type: Types = Types.Data, rank = 1, name, injectedUID?): ID => {
  let { uuid, date } = getIDParts();
  uuid = injectedUID ? injectedUID : uuid;
  let title = `${type} ${rank} ${name}`;
  let idTitle = `${title} ${uuid}`;
  let id_Title = stringNoSpaces(idTitle);
  let idString = `${title} ${stringNoSpaces(date)} ${uuid}`;
  let id = stringNoSpaces(idString);
  return new ID({ id, date, uuid, title, id_Title }) as ID;
}