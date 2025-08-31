import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProblems, updateUserProgress } from "../api/apiClient";

const ExploreExerciseDetail = () => {
  const { exerciseId } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery(["problem", exerciseId], () =>
    getProblems({ _id: exerciseId })
  );
  const exercise = data?.data?.[0];
  const [answer, setAnswer] = useState("");
  const [completed, setCompleted] = useState(false);
  const mutation = useMutation(updateUserProgress, {
    onSuccess: () => {
      setCompleted(true);
      queryClient.invalidateQueries(["dashboard"]);
    },
  });
  if (isLoading) return <div>Loading exercise...</div>;
  if (isError || !exercise) return <div>Error loading exercise.</div>;
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{exercise.title}</h1>
      <div className="mb-4 text-gray-700">{exercise.description}</div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Your Answer:</label>
        <textarea
          className="w-full border rounded p-2"
          rows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={() =>
          mutation.mutate({
            problem: exercise._id,
            status: "completed",
            subject: exercise.topic?.subject,
          })
        }
        disabled={completed}
      >
        {completed ? "Completed" : "Mark as Completed"}
      </button>
      <div className="mt-4">
        <Link
          to={`/explore/topic/${exercise.topic?._id || ""}`}
          className="text-gray-500 hover:underline"
        >
          ← Back to Exercises
        </Link>
      </div>
    </div>
  );
};

export default ExploreExerciseDetail;
