import { User } from './User';
import { Data } from './Data';
import { genID } from '../ID';
import { Message } from './Message';
import { Types } from '../types/types';
import { countPropertiesInObject, isValid, stringNoSpaces } from '../constants';

export enum ChatTypes {
    Self = `Self`,
    Group = `Group`,
    Direct = `Direct`,
}

export class Chat extends Data {
    A?: any;

    name: string;
    creator: string;

    owner: string;
    ownerID: string;
    ownerUID: string;

    type: Types = Types.Chat;
    chatType: ChatTypes = ChatTypes.Direct;

    image = ``;
    description = ``;
    color = `Default`;

    lastMessageSender;
    lastMessage?: Message;
    lastMessageID?: string;

    data?: { [key: string]: string[] } = {
        users: [],
    }

    constructor(data: Partial<Chat>) {
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

export const createChat = (
    rank: number,
    name: string,
    user: User | any,
    userEmails: string[] = [],
    chatType: ChatTypes = ChatTypes.Direct,
    lastMessage?: Message | any,
    color = `Default`,
    description = ``,
    image = ``,
    type = Types.Chat,
) => {
    let chat: Chat = new Chat({
        name,
        type,
        rank,
        chatType,
        color,
        description,
        image,
        lastMessage,

        ...(user != null && {
            ownerID: user?.id,
            email: user?.email,
            owner: user?.email,
            ownerUID: user?.uid,
            creator: user?.email,
        }),
    }) as Chat;

    if (user != null) {
        let title = stringNoSpaces(chat?.title);
        let idTitle = user?.email + `_` + title;
        let extensionIDs = `_` + chat?.uuid + `_` + user?.uid;

        chat.ID = idTitle + extensionIDs;
        chat.uid = title + `_` + chat?.uuid + `_` + user?.email;
        chat.id = idTitle + `_` + stringNoSpaces(chat?.meta?.created) + extensionIDs;

        chat.data = {
            ...chat?.data,
            users: userEmails?.length > 0 ? userEmails : [user?.email],
        }
    }

    return chat;
}