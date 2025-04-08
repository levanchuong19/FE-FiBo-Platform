import { User } from "./user";

export interface Reaction {
    id: string;
    account: User;
    type: string;
}