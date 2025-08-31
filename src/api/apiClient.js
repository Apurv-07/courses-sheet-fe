const api = axios.create({
  baseURL: "https://courses-sheet-be.onrender.com/api",
  // baseURL: "http://localhost:5000/api",
});
export const getAdminDashboard = () => api.get("/admin-dashboard");

// Topic CRUD: subject required only for creation
export const createTopic = (data) => {
  if (!data.subject) throw new Error("'subject' is required in topic payload");
  return api.post(`/topics?subject=${data.subject}`, data);
};
export const updateTopic = (data) => {
  console.log("Updating topic", data);
  api.put(`/topics/${data.id}`, { name: data.name, content: data.content });
};
export const deleteTopic = (id) => api.delete(`/topics/${id}`);

// Exercise CRUD with subject/topic context
export const createExercise = (subjectId, topicId, data) =>
  api.post(`/subjects/${subjectId}/topics/${topicId}/exercises`, data);
export const updateExercise = (subjectId, topicId, exerciseId, data) =>
  api.put(
    `/subjects/${subjectId}/topics/${topicId}/exercises/${exerciseId}`,
    data
  );
export const deleteExercise = (subjectId, topicId, exerciseId) =>
  api.delete(
    `/subjects/${subjectId}/topics/${topicId}/exercises/${exerciseId}`
  );
// Registration and normal login
export const register = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);
// Admin: Assign/Remove subject to/from user
export const assignSubjectToUser = (userId, subjectId) => {
  console.log("IIIIIIIIIIIIIIIIII", userId, subjectId);
  return api.post("/assign-subject", { userId, subjectId });
};
export const removeSubjectFromUser = (userId, subjectId) =>
  api.post("/remove-subject", { userId, subjectId });

// User: Dashboard and progress
export const getUserDashboard = () => api.get("/dashboard");
export const getUser = () => api.get("/user");
export const updateUserProgress = (data) => api.post("/progress", data);
import axios from "axios";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Category
export const getCategories = () => api.get("/categories");
export const createCategory = (data) => api.post("/categories", data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Subject
export const getSubjectsAll = () => api.get("/subjects");
export const getSubjects = (params) => api.get("/subjects", { params });
export const createSubject = (data) => api.post("/subjects", data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);

// Topic
export const getTopics = (params) => api.get("/topics", { params });
export const toggleTopicStatus = (topicId) =>
  api.post("/topics/toggle-status", { topicId });
export const toggleTopicCompletion = (topicId) =>
  api.post("/progress/topic-toggle", { topicId });

// Problem
export const getProblems = (params) => api.get("/problems", { params });
export const createProblem = (data) => api.post("/problems", data);
export const updateProblem = (id, data) => api.put(`/problems/${id}`, data);
export const deleteProblem = (id) => api.delete(`/problems/${id}`);

// Auth
export const getProfile = () => api.get("/user/profile");
export const googleLogin = (idToken) => api.post("/auth/google", { idToken });
export const saveExerciseAttempt = (payload) =>
  api.post("/progress/attempt", payload);
// Progress summary for dashboard (per-user aggregates)
export const getProgressSummary = () => api.get("/progress/summary");
// Get list of user's progress entries
export const getUserProgress = () => api.get("/progress");
export const getAllSubmissions = () => api.get("/progress/all");
export const updateUserCurrentTopic = (userId, topicId) =>
  api.post("/user/update-current-topic", { userId, currentTopic: topicId });

// helper for creating problem with links
export const createProblemWithLinks = (data) => api.post("/problems", data);
export const updateProblemWithLinks = (id, data) =>
  api.put(`/problems/${id}`, data);

export default api;
