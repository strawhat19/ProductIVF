import { genID } from '../ID';
import { Types } from '../types/types';
import { countPropertiesInObject, isValid } from '../constants';

export class Data {
  A?: any;

  ID: any;
  id!: string;
  uid: string;
  rank: number;
  uuid: string;
  name!: string;
  email: string;
  title?: string;
  properties: number;
  type: Types = Types.Data;

  meta = {
    created: undefined,
    updated: undefined,
    createdby: undefined,
    updatedby: undefined,
  }

  constructor(data: Partial<Data>) {
    Object.assign(this, data);

    this.A = this.name;
    
    let ID = genID(this.type, this.rank, this.name, this.uid);
    let { id, date, title, uuid } = ID;

    if (!isValid(this.id)) this.id = id;
    if (!isValid(this.uuid)) this.uuid = uuid;
    if (!isValid(this.title)) this.title = title;
    if (!isValid(this.meta.created)) this.meta.created = date;
    if (!isValid(this.meta.updated)) this.meta.updated = date;
    if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
  }
}