import { User } from './User';
import { Data } from './Data';
import { genID } from '../ID';
import { Types } from '../types/types';
import { countPropertiesInObject, isValid, stringNoSpaces } from '../constants';

export class Message extends Data {
    A?: any;

    name: string;
    creator: string;
    senderID: string;
    senderEmail: string;

    chatID: string;
    type: Types = Types.Message;

    image = ``;
    description = ``;
    color = `Default`;

    content = ``;
    date: string | Date = ``;
    
    read = false;
    edited = false;
    pinned = false;

    media;
    links;
    views;
    points;
    mentions;
    reactions;
    attachments;
    
    recipients: string[];

    data?: { [key: string]: string[] } = {
        users: [],
    }

    constructor(data: Partial<Message>) {
        super(data);
        Object.assign(this, data);

        this.A = this.name;

        let ID = genID(this.type, this.rank, this.name);
        let { id, date, title, uuid } = ID;

        if (!isValid(this.id)) this.id = id;
        if (!isValid(this.uuid)) this.uuid = uuid;
        if (!isValid(this.date)) this.date = date;
        if (!isValid(this.title)) this.title = title;
        if (!isValid(this.meta.created)) this.meta.created = date;
        if (!isValid(this.meta.updated)) this.meta.updated = date;
        if (!isValid(this.properties)) this.properties = countPropertiesInObject(this) + 1;
    }
}

export const createMessage = (
    rank: number,
    content = ``,
    user: User | any,
    chatID: string,
    recipients: string[],
    image = ``,
    description = ``,
    color = `Default`,
    type = Types.Message,
    name: string = content,
) => {
    let message: Message = new Message({
        name,
        type,
        rank,
        chatID,
        content,
        image,
        description,
        color,
        recipients,

        ...(user != null && {
            ownerID: user?.id,
            email: user?.email,
            owner: user?.email,
            ownerUID: user?.uid,
            creator: user?.email,
            senderID: user?.uid,
            senderEmail: user?.email,
        }),
    }) as Message;

    if (user != null) {
        let title = stringNoSpaces(message?.title);
        let idTitle = user?.email + `_` + title;
        let extensionIDs = `_` + message?.uuid + `_` + user?.uid;

        message.ID = idTitle + extensionIDs;
        message.uid = title + `_` + message?.uuid + `_` + user?.email;
        message.id = idTitle + `_` + stringNoSpaces(message?.meta?.created) + extensionIDs;

        message.data = {
            ...message.data,
            users: [user?.email, ...message?.recipients?.filter(r => r?.toLowerCase() != user?.email?.toLowerCase())],
        }
    }

    return message;
}