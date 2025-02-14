import { Data } from './Data';
import { genID } from '../ID';
import { GridTypes, Types } from '../types/types';
import { countPropertiesInObject, isValid } from '../constants';

export class Grid extends Data {
    ID: any;
    owner: string;
    creator: string;
    ownerid: string;
    ownerID: string;
    ownerUID: string;
    creatorid: string;
    creatorID: string;
    creatorUID: string;
    type: Types = Types.Grid;
    gridType: GridTypes = GridTypes.Personal;

    options = {
        active: false,
        private: true,
    }

    data?: { [key: string]: string[] } = {
        users: [],
        boardIDs: [],
    }

    constructor(data: Partial<Grid>) {
        super(data);
        Object.assign(this, data);

        this.A = this.name;

        let ID = genID(this.type, this.rank, this.name);
        let { id, date, title, uuid } = ID;

        if (!isValid(this.id)) this.id = id;
        if (!isValid(this.uuid)) this.uuid = uuid;
        if (!isValid(this.title)) this.title = title;
        if (!isValid(this.meta.created)) this.meta.created = date;
        if (!isValid(this.meta.updated)) this.meta.updated = date;
        if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
    }
}