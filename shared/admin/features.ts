import moment from 'moment-timezone';
import { Types } from '../types/types';
import { momentFormats } from '../constants';

export const makeTitleFromID = (id) => id && typeof id != `number` && id.includes(`_`) ? id.replaceAll(`_`, ` `) : id;

export enum FeatureIDs {
    Light_Mode = `Light Mode`,
    Delete_Self = `Delete Self`,
}

export class Feature {
    enabled: boolean = false;
    id: FeatureIDs | string | any = FeatureIDs.Light_Mode;
    
    name: string = makeTitleFromID(this.id);
    description: string = `Feature Flag / Toggle for Feature ID ${this.id} set to ${this.enabled}`;
    
    beta?: boolean = false;
    type: Types = Types.Feature;
    maintenance?: boolean = false;
    general?: boolean = this.enabled;
    controls?: { [key: string]: boolean };
    lastMadePublic?: string | Date = this.lastUpdated;
    lastMadePublicBy?: string = `email@productivf.com`;
    lastUpdated?: string | Date = moment()?.format(momentFormats?.default);
    
    constructor(data: Partial<Feature>) {
       Object.assign(this, data);
    }
}