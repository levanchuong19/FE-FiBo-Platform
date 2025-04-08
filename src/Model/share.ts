import { User } from "./user";

export interface Share {
    id: string;
    account: User;
    sharedAt: string;
}