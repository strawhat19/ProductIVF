import { Types } from '../types/types';

export const makeTitleFromID = (id) => id && typeof id != `number` && id.includes(`_`) ? id.replaceAll(`_`, ` `) : id;

export enum FeatureIDs {
    Light_Mode = `Light_Mode`,
    Delete_Self = `Delete_Self`,
}

export class Feature {
    roles?: string[];
    id: FeatureIDs | string | any = FeatureIDs.Light_Mode;
    name: string = makeTitleFromID(this.id);
    description: string = `Feature Flag / Toggle for Feature ID ${this.id}`;

    type: Types = Types.Feature;
    controls?: { [key: string]: boolean };

    status = {
        beta: false,
        public: false,
        maintenance: false,
    }

    meta = {
        created: ``,
        updated: ``,
        updatedBy: ``,
        createdBy: ``,
        lastMadePublic: ``,
        lastMadePublicBy: ``,
    }
    
    constructor(data: Partial<Feature>) {
       Object.assign(this, data);
    }
}