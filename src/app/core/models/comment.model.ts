export interface UserRef {
  _id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
}

export interface Comment {
  _id: string;
  content: string;
  userId: UserRef;
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: Comment;
}

export interface CommentListResponse {
  success: boolean;
  message: string;
  data: Comment[];
}
