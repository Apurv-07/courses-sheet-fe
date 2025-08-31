import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  getProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  assignSubjectToUser,
  removeSubjectFromUser,
  getAdminDashboard,
} from "../api/apiClient";

export default function Admin() {
  // This page has been removed/archived during cleanup. If you need it restored,
  // retrieve it from version control or remove this stub and add the original.
  return null;
}
