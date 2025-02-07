import { genID } from '../ID';
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

export class User {
  A?: any;

  id!: string;
  uuid?: string;
  uid: string = ``;

  title?: string;
  password?: string;

  phone: any;
  avatar: any;
  name!: string;
  rank: number = 1;
  email: string = ``;
  properties: number;

  type: Types = Types.User;
  role = ROLES.Subscriber.name;

  boards?: any[];

  data = {
    taskIDs: [],
    itemIDs: [],
    listIDs: [],
    boardIDs: [],
    gridIDs: [],
    friendIDs: [],
    sharedIDs: [],
  }

  meta = {
    created: undefined,
    updated: undefined,
    provider: Providers.Firebase,
  }

  auth = {
    token: undefined,
    verified: undefined,
    anonymous: undefined,
  }

  constructor(data: Partial<User>) {
    Object.assign(this, data);
    if (isValid(this.email) && !isValid(this.name)) this.name = capWords(this.email.split(`@`)[0]);
    this.A = this.name;
    let ID = genID(Types.User, undefined, this.name, this.uid);
    let { id, date, title, uuid } = ID;
    if (!isValid(this.id)) this.id = id;
    if (!isValid(this.uuid)) this.uuid = uuid;
    if (!isValid(this.title)) this.title = title;
    if (!isValid(this.meta.created)) this.meta.created = date;
    if (!isValid(this.meta.updated)) this.meta.updated = date;
    if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
  }
}