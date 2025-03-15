import { Data } from './Data';
import { genID } from '../ID';
import { User } from './User';
import { TasksFilterStates, Types } from '../types/types';
import { BoardTypes } from '../../components/boards/boards';
import { countPropertiesInObject, isValid, stringNoSpaces } from '../constants';

export class Board extends Data {
    ID: any;
    number: number;
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
        tasksFilterState: TasksFilterStates.Tasks,
    }

    data?: { [key: string]: string[] } = {
        users: [],
        itemIDs: [],
        listIDs: [],
        taskIDs: [],
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

export const createBoard = (
    rank: number, 
    name: string, 
    user: User | any, 
    titleWidth: string = `140px`, 
    number: number = 1,
    gridID = ``, 
    listIDs = [], 
    itemIDs = [], 
    boardType = BoardTypes.Kanban,
    color = `Default`,
    description = ``,
    image = ``,
    type = Types.Board, 
) => {

    let board: Board = new Board({
        name,
        type,
        rank,
        number,
        gridID,
        boardType,
        titleWidth,

        image,
        color,
        description,

        ...(user != null && {
            ownerID: user?.id,
            email: user?.email,
            owner: user?.email,
            ownerUID: user?.uid,
            creator: user?.email,
        }),
    }) as Board;

    if (user != null) {
        let title = stringNoSpaces(board?.title);
        let idTitle = user?.email + `_` + title;
        let extensionIDs = `_` + board?.uuid + `_` + user?.uid;

        board.ID = idTitle + extensionIDs;
        board.uid = title + `_` + board?.uuid + `_` + user?.email;
        board.id = idTitle + `_` + stringNoSpaces(board?.meta?.created) + extensionIDs;

        board.data = {
            ...board?.data,
            listIDs,
            itemIDs,
            ...(user != null && {
                users: [user?.email],
            }),
        }
    }

    return board;
}