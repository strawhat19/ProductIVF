import { Data } from './Data';
import { genID } from '../ID';
import { Types } from '../types/types';
import { BoardTypes } from '../../components/boards/boards';
import { countPropertiesInObject, isValid } from '../constants';

export class Board extends Data {
    ID: any;
    owner: string;
    gridID: string;
    titleWidth: any;
    creator: string;
    ownerid: string;
    ownerID: string;
    ownerUID: string;
    creatorid: string;
    creatorID: string;
    creatorUID: string;
    type: Types = Types.Board;
    boardType: BoardTypes = BoardTypes.Kanban;
    
    options = {
        private: true,
        expanded: true,
        focused: false,
        filterActive: false,
    }

    data?: { [key: string]: string[] } = {
        users: [],
        itemIDs: [],
        taskIDs: [],
        columnIDs: [],
    }

    constructor(data: Partial<Board>) {
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