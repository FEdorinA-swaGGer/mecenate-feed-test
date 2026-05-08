import { AuthorDto, PostDto } from '../../feed/api/feed.types';

export type CommentDto = {
  id: string;
  postId: string;
  author: AuthorDto;
  text: string;
  createdAt: string;
};

export type PostDetailResponseDto = {
  ok: boolean;
  data: {
    post: PostDto;
  };
};

export type ToggleLikeResponseDto = {
  ok: boolean;
  data: {
    isLiked: boolean;
    likesCount: number;
  };
};

export type CommentsPageDto = {
  comments: CommentDto[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type CommentsResponseDto = {
  ok: boolean;
  data: CommentsPageDto;
};

export type CreateCommentPayloadDto = {
  text: string;
};

export type CreateCommentResponseDto = {
  ok: boolean;
  data: {
    comment: CommentDto;
  };
};

export type WsPingEvent = {
  type: 'ping';
};

export type WsLikeUpdatedEvent = {
  type: 'like_updated';
  postId: string;
  likesCount: number;
};

export type WsCommentAddedEvent = {
  type: 'comment_added';
  postId: string;
  comment: CommentDto;
};

export type PostRealtimeEvent =
  | WsPingEvent
  | WsLikeUpdatedEvent
  | WsCommentAddedEvent;
