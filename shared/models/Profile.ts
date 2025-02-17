import { User } from './User';
import { Types } from '../types/types';

export class Profile {
    A: any;
    id: string;
    ID: string;
    uid: string;
    uuid: string;
    rank: number;
    name: string;
    role: string;
    title: string;
    email: string;
    image: string;
    color: string;
    signedIn: any;
    phone: string;
    provider: any;
    avatar: string;
    created: string;
    type: Types = Types.Profile;
    constructor(usr: User) {
        let { A, ID, id, uid, uuid, rank, name, title, role, email, image, avatar, phone, color, signedIn, provider, meta } = usr;
        let obj = { 
            A, 
            uid, 
            uuid, 
            rank, 
            name, 
            role, 
            title,
            color,
            email, 
            image, 
            phone, 
            avatar, 
            provider,
            signedIn,
            created: meta?.created,
            id: id?.replaceAll(Types.User, Types.Profile), 
            ID: ID?.replaceAll(Types.User, Types.Profile), 
        };
        Object.assign(this, obj);
    }
}