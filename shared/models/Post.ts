import { User } from './User';
import { Data } from './Data';
import { genID } from '../ID';
import { Types } from '../types/types';
import { countPropertiesInObject, isValid, stringNoSpaces } from '../constants';

export enum PostTypes {
    Text = `Text`,
    File = `File`,
    Image = `Image`,
    Video = `Video`,
}

export class Post extends Data {
    A?: any;

    name: string;
    creator: string;

    owner: string;
    ownerID: string;
    ownerUID: string;

    type: Types = Types.Post;
    postType: PostTypes = PostTypes.Text;

    url = ``;
    image = ``;
    description = ``;
    color = `Default`;

    content = ``;
    date: string | Date = ``;

    read = false;
    edited = false;
    pinned = false;

    file;
    media;
    links;
    views;
    points;
    mentions;
    reactions;
    attachments;

    data?: { [key: string]: string[] } = {
        users: [],
    }

    constructor(data: Partial<Post>) {
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

export const createPost = (
    rank: number,
    name: string,
    user: User | any,
    userEmails: string[] = [],
    postType: PostTypes = PostTypes.Text,
    color = `Default`,
    description = ``,
    image = ``,
    type = Types.Post,
) => {
    let post: Post = new Post({
        name,
        type,
        rank,
        postType,
        color,
        description,
        image,

        ...(user != null && {
            ownerID: user?.id,
            email: user?.email,
            owner: user?.email,
            ownerUID: user?.uid,
            creator: user?.email,
        }),
    }) as Post;

    if (user != null) {
        let title = stringNoSpaces(post?.title);
        let idTitle = user?.email + `_` + title;
        let extensionIDs = `_` + post?.uuid + `_` + user?.uid;

        post.ID = idTitle + extensionIDs;
        post.uid = title + `_` + post?.uuid + `_` + user?.email;
        post.id = idTitle + `_` + stringNoSpaces(post?.meta?.created) + extensionIDs;

        post.data = {
            ...post?.data,
            users: userEmails?.length > 0 ? userEmails : [user?.email],
        }
    }

    return post;
}