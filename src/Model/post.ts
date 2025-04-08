import { Comment } from "./comment";
import { Reaction } from "./reaction";
import { Share } from "./share";
import { User } from "./user";

export interface Post {
    id: string;
    author: User;
    content: string | null;
    mediaUrls: string[] | null;
    mediaType: string | null;
    createdAt: string;
    reactions: Reaction[];
    comments: Comment[];
    shares: Share[];
  }
  