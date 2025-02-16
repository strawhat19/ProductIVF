import { Data } from './Data';
import { genID } from '../ID';
import { TasksFilterStates, Types } from '../types/types';
import { BoardTypes } from '../../components/boards/boards';
import { countPropertiesInObject, isValid } from '../constants';

export class Board extends Data {
    ID: any;
    gridID: string;
    titleWidth: any;

    creator: string;

    owner: string;
    ownerID: string;
    ownerUID: string;

    type: Types = Types.Board;
    boardType: BoardTypes = BoardTypes.Kanban;

    image = ``;
    description = ``;
    color = `Default`;
    
    options = {
        private: true,
        expanded: true,
        focused: false,
        archived: false,
        hideCompleted: false,
        hideCoverImages: false,
        tasksFilterState: TasksFilterStates.All_On,
    }

    data?: { [key: string]: string[] } = {
        users: [],
        itemIDs: [],
        listIDs: [],
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