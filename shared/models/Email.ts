import { User } from './User';
import { Types } from '../types/types';

export class Email {
    A: any;
    id: string;
    ID: string;
    uid: string;
    uuid: string;
    rank: number;
    name: string;
    role: string;
    email: string;
    image: string;
    phone: string;
    token: string;
    avatar: string;
    type: Types = Types.Email;
    constructor(usr: User) {
        let { A, ID, id, uid, uuid, rank, name, role, email, image, avatar, phone, token } = usr;
        let obj = { 
            A, 
            uid, 
            uuid, 
            rank, 
            name, 
            role, 
            email, 
            image, 
            phone, 
            token, 
            avatar, 
            id: id?.replaceAll(Types.User, Types.Email), 
            ID: ID?.replaceAll(Types.User, Types.Email), 
        };
        Object.assign(this, obj);
    }
}