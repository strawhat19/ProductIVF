import { Data } from './Data';
import { genID } from '../ID';
import { User } from './User';
import { GridTypes, Types } from '../types/types';
import { countPropertiesInObject, isValid, stringNoSpaces } from '../constants';

export class Grid extends Data {
    ID: any;
    number: number;
    
    creator: string;

    owner: string;
    ownerID: string;
    ownerUID: string;
    
    type: Types = Types.Grid;
    gridType: GridTypes = GridTypes.Personal;

    items?: any;
    tasks?: any;
    lists?: any;
    boards?: any;
    focusedBoard?: any;

    image = ``;
    description = ``;
    color = `Default`;

    options = {
        private: true,
        archived: false,
        nameLabel: true,
        newestBoardsOnTop: true,
    }

    data?: { [key: string]: string[] } = {
        users: [],
        itemIDs: [],
        listIDs: [],
        taskIDs: [],
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

export const createGrid = (
    rank: number, 
    name: string, 
    user: User, 
    gridType = GridTypes.Personal,
    boardIDs = [],
    number: number = 1, 
    color = `Default`,
    description = ``,
    image = ``,
    type = Types.Grid, 
) => {

    let grid: Grid = new Grid({
        name,
        type,
        rank,
        number,
        gridType,

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
    }) as Grid;

    if (user != null) {
        let title = stringNoSpaces(grid?.title);
        let idTitle = user?.email + `_` + title;
        let extensionIDs = `_` + grid?.uuid + `_` + user?.uid;

        grid.ID = idTitle + extensionIDs;
        grid.uid = title + `_` + grid?.uuid + `_` + user?.email;
        grid.id = idTitle + `_` + stringNoSpaces(grid?.meta?.created) + extensionIDs;

        grid.data = {
            ...grid.data,
            boardIDs,
            ...(user != null && {
                users: [user?.email],
            }),
        }
    }

    return grid;
}