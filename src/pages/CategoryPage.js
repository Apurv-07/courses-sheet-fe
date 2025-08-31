import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/apiClient";
import CategoryList from "../components/DSA/CategoryList";
import CategoryForm from "../components/DSA/CategoryForm";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ErrorAlert from "../components/UI/ErrorAlert";

const CategoryPage = () => {
  // Archived/removed during cleanup. Restore from version control if needed.
  return null;
};

export default CategoryPage;
