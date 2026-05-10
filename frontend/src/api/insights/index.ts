import { API } from "../api";

// GET AI insights
export const getInsights = (userId: string) =>
  API.get(`/insights?userId=${userId}`);