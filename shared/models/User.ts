import { genID } from '../ID';
import { Data } from './Data';
import { Types } from '../types/types';
import { capWords } from '../../pages/_app';
import { countPropertiesInObject, isValid } from '../constants';

export enum Providers { 
  Google = `Google` ,
  Firebase = `Firebase`, 
}

export enum Roles {
  Guest = `Guest`,
  Subscriber = `Subscriber`,
  Editor = `Editor`,
  Moderator = `Moderator`,
  Administrator = `Administrator`,
  Developer = `Developer`,
  Owner = `Owner`,
}

export enum RolesMap {
  Guest = 1,
  Subscriber = 2,
  Editor = 3,
  Moderator = 4,
  Administrator = 5,
  Developer = 6,
  Owner = 7,
}

export class Role {
  name: any;
  level: number;
  constructor(level: number, role: string) {
    this.name = role;
    this.level = level;
  }
}
  
export const ROLES = {
  Guest: new Role(1, Roles.Guest),
  Subscriber: new Role(2, Roles.Subscriber),
  Editor: new Role(3, Roles.Editor),
  Moderator: new Role(4, Roles.Moderator),
  Administrator: new Role(5, Roles.Administrator),
  Developer: new Role(6, Roles.Developer),
  Owner: new Role(7, Roles.Owner),
}

export class User extends Data {
  ID: any;

  phone: any;
  avatar: any;
  token: string;
  password?: string;
  email: string = ``;
  provider: Providers.Firebase;
  lastSelectedGridID: string = ``;

  type: Types = Types.User;
  role = ROLES.Subscriber.name;

  color = `Default`;
  description = ``;
  image = ``;

  options = {
    active: true,
    verified: false,
    anonymous: false,
  }

  data?: { [key: string]: string[] } = {
    gridIDs: [],
    friendIDs: [],
    selectedGridIDs: [],
  }

  constructor(data: Partial<User>) {
    super(data);
    Object.assign(this, data);

    if (isValid(this.email) && !isValid(this.name)) this.name = capWords(this.email.split(`@`)[0]);

    this.A = this.name;

    let ID = genID(this.type, this.rank, this.name, this.uid);
    let { id, date, title, id_Title } = ID;

    if (!isValid(this.id)) this.id = id;
    if (!isValid(this.title)) this.title = title;
    if (!isValid(this.uuid)) this.uuid = id_Title;
    if (!isValid(this.meta.created)) this.meta.created = date;
    if (!isValid(this.meta.updated)) this.meta.updated = date;
    if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
  }
}