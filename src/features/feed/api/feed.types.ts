export type AuthorDto = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
};

export type PostDto = {
  id: string;
  author: AuthorDto;
  title: string;
  body: string;
  preview: string;
  coverUrl: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  tier: 'free' | 'paid';
  createdAt: string;
};

export type PostsPageDto = {
  posts: PostDto[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type PostsResponseDto = {
  ok: boolean;
  data: PostsPageDto;
};
