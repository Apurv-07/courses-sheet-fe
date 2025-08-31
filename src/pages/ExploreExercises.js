import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProblems } from "../api/apiClient";

const ExploreExercises = () => {
  const { topicId } = useParams();
  const { data, isLoading, isError } = useQuery(["problems", topicId], () =>
    getProblems({ topic: topicId })
  );
  if (isLoading) return <div>Loading exercises...</div>;
  if (isError) return <div>Error loading exercises.</div>;
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Exercises</h1>
      <ul className="divide-y divide-gray-200">
        {data?.data?.map((ex) => (
          <li key={ex._id} className="py-3">
            <Link
              to={`/explore/exercise/${ex._id}`}
              className="text-blue-600 hover:underline text-lg"
            >
              {ex.title}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Link
          to={`/explore/topic/${topicId}`}
          className="text-gray-500 hover:underline"
        >
          ← Back to Topics
        </Link>
      </div>
    </div>
  );
};

export default ExploreExercises;
