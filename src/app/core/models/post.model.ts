export interface Author {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: Comment;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  image?: string;
  tags?: string[];
  commentIds: Comment[];
  userId: string;
  author?: {
    _id: string;
    email: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface PostResponse {
  success: boolean;
  message: string;
  data: Post;
}

export interface PostListResponse {
  success: boolean;
  message: string;
  data: Post[];
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}
