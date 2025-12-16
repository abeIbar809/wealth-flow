import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.13:9000/api",
});

export const getPosts = () => API.get("/posts");
export const createPost = (post: { title: string; content: string }) => API.post("/posts", post);
export const deletePost = (id: string) => API.delete(`/posts/${id}`);
export const addReply = (postId: string, content: string) => API.post(`/posts/${postId}/replies`, { content });
export const deleteReply = (postId: string, replyId: string) => API.delete(`/posts/${postId}/replies/${replyId}`);
