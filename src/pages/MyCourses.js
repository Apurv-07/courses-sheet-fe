import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserDashboard,
  getProblems,
  saveExerciseAttempt,
} from "../api/apiClient";

// Simple helper to group problems by topic id
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

export default function MyCourses() {
  const queryClient = useQueryClient();
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);

  const { data, isLoading, isError } = useQuery(
    ["userDashboard"],
    getUserDashboard,
    {
      refetchOnWindowFocus: false,
    }
  );
  const dash = data?.data?.data || {};
  const subjects = Array.isArray(dash.subjects) ? dash.subjects : [];

  // Fetch all problems for currently opened subject (across its topics)
  const { data: subjectProblemsData, isLoading: problemsLoading } = useQuery(
    ["problemsBySubject", activeSubjectId],
    () => getProblems({ subject: activeSubjectId }),
    {
      enabled: !!activeSubjectId,
    }
  );
  const subjectProblems =
    subjectProblemsData?.data?.data || subjectProblemsData?.data || [];

  // Group problems by topic id for quick rendering
  const problemsByTopic = useMemo(() => {
    return groupBy(subjectProblems, (p) => String(p.topic?._id || p.topic));
  }, [subjectProblems]);

  const saveAttempt = useMutation((payload) => saveExerciseAttempt(payload), {
    onSuccess: () => {
      // Refresh dashboard/progress after submit
      queryClient.invalidateQueries(["userDashboard"]);
    },
  });

  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto py-6">Loading your courses...</div>
    );
  if (isError)
    return (
      <div className="max-w-3xl mx-auto py-6">Failed to load your courses.</div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Courses</h1>
      {subjects.length === 0 ? (
        <div>You don\'t have any assigned subjects yet.</div>
      ) : (
        <div className="space-y-4">
          {subjects.map((subj) => (
            <div key={subj._id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{subj.name}</h2>
                <button
                  className="text-blue-600 underline"
                  onClick={() =>
                    setActiveSubjectId((id) =>
                      id === subj._id ? null : subj._id
                    )
                  }
                >
                  {activeSubjectId === subj._id ? "Hide" : "Open"}
                </button>
              </div>

              {activeSubjectId === subj._id && (
                <div className="mt-3">
                  {/* Topics list */}
                  <ul className="space-y-2">
                    {(subj.topics || []).map((t) => (
                      <li key={t._id} className="border rounded p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{t.name}</div>
                          </div>
                          <button
                            className="text-sm text-blue-600 underline"
                            onClick={() =>
                              setActiveTopicId((tid) =>
                                tid === t._id ? null : t._id
                              )
                            }
                          >
                            {activeTopicId === t._id
                              ? "Hide Exercises"
                              : "View Exercises"}
                          </button>
                        </div>

                        {/* Exercises under topic */}
                        {activeTopicId === t._id && (
                          <div className="mt-2 space-y-2">
                            {problemsLoading ? (
                              <div>Loading exercises...</div>
                            ) : (
                              (problemsByTopic[String(t._id)] || []).map(
                                (p) => (
                                  <ExerciseRow
                                    key={p._id}
                                    exercise={p}
                                    onSubmit={(payload) =>
                                      saveAttempt.mutate(payload)
                                    }
                                  />
                                )
                              )
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExerciseRow({ exercise, onSubmit }) {
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("attempted");

  return (
    <div className="border rounded p-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-semibold">{exercise.title}</div>
          {exercise.link && (
            <a
              href={exercise.link}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline text-sm"
            >
              Open resource
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="border px-2 py-1 rounded text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="attempted">Attempted</option>
            <option value="completed">Completed</option>
          </select>
          <button
            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
            onClick={() =>
              onSubmit({ exerciseId: exercise._id, answer, status })
            }
          >
            Save
          </button>
        </div>
      </div>
      <textarea
        className="mt-2 w-full border rounded p-2 text-sm"
        placeholder="Notes/answer"
        rows={2}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
    </div>
  );
}
