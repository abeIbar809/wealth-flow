import { API } from "../api";

export const getPosts = () => API.get("/posts");

export const createPost = (post: {
  title: string;
  content: string;
  username: string;
  category: "financial" | "app" | "social" | "other";
}) => API.post("/posts", post);

export const deletePost = (id: string) => API.delete(`/posts/${id}`);

export const flagPost = (id: string, flagReason: string) =>
  API.patch(`/posts/${id}/flag`, { flagReason });

export const addReply = (postId: string, content: string) =>
  API.post(`/posts/${postId}/replies`, { content });

export const deleteReply = (postId: string, replyId: string) =>
  API.delete(`/posts/${postId}/replies/${replyId}`);