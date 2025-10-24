import { UserRef } from './comment.model';

export interface Reply {
  _id: string;
  content: string;
  userId: UserRef;
  commentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReplyResponse {
  success: boolean;
  message: string;
  data: Reply;
}

export interface ReplyListResponse {
  success: boolean;
  message: string;
  data: {
    replies: Reply[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateReplyData {
  content: string;
  commentId: string;
}
