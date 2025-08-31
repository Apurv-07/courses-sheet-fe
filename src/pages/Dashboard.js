import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserDashboard,
  getAdminDashboard,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getTopics,
  getUser,
  createTopic,
  updateTopic,
  deleteTopic,
  getProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  assignSubjectToUser,
  removeSubjectFromUser,
  getProgressSummary,
  saveExerciseAttempt,
  getUserProgress,
  toggleTopicCompletion,
  updateUserCurrentTopic,
} from "../api/apiClient";

const Dashboard = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const queryClient = useQueryClient();

  // Admin dashboard stats
  const {
    data: adminStats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery(["adminDashboard"], getAdminDashboard, {
    enabled: user?.role === "admin",
  });

  // Fetch all users for assignment
  const {
    data: userData = [],
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery(
    ["users"],
    async () => {
      const res = await getUser();
      return res.data;
    },
    { enabled: !!user && user.role === "admin" } // ensures user exists first
  );

  // Fetch all subjects for assignment
  const {
    data: allSubjects = { data: [] },
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useQuery(["allSubjects"], () => getSubjects({}), {
    enabled: user?.role === "admin",
  });
  // Correctly extract subjects list from allSubjects.data.data if present
  const subjectsList = Array.isArray(allSubjects.data?.data)
    ? allSubjects.data.data
    : Array.isArray(allSubjects.data)
    ? allSubjects.data
    : [];
  console.log("Subjects List:", subjectsList);

  // Assignment mutations
  const assignSubject = useMutation(
    ({ userId, subjectId }) => assignSubjectToUser(userId, subjectId),
    { onSuccess: () => queryClient.invalidateQueries(["users"]) }
  );
  const removeSubject = useMutation(
    ({ userId, subjectId }) => removeSubjectFromUser(userId, subjectId),
    { onSuccess: () => queryClient.invalidateQueries(["users"]) }
  );

  // Category CRUD
  const { data: catData = { data: [] } } = useQuery(
    ["categories"],
    getCategories,
    { enabled: user?.role === "admin" }
  );
  const categories = Array.isArray(catData.data)
    ? catData.data
    : Array.isArray(catData.categories)
    ? catData.categories
    : Array.isArray(catData)
    ? catData
    : [];
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const createCat = useMutation(createCategory, {
    onSuccess: () => queryClient.invalidateQueries(["categories"]),
  });
  const updateCat = useMutation(({ id, data }) => updateCategory(id, data), {
    onSuccess: () => queryClient.invalidateQueries(["categories"]),
  });
  const deleteCat = useMutation(deleteCategory, {
    onSuccess: () => queryClient.invalidateQueries(["categories"]),
  });

  // Topic CRUD
  const { data: topicData = { data: [] } } = useQuery(
    ["topics", selectedSubject?._id],
    () => getTopics({ subject: selectedSubject?._id }),
    { enabled: !!selectedSubject && user?.role === "admin" }
  );
  const createTopicM = useMutation(createTopic, {
    onSuccess: () =>
      queryClient.invalidateQueries(["topics", selectedSubject?._id]),
  });
  const updateTopicM = useMutation(({ id, data }) => updateTopic(id, data), {
    onSuccess: () =>
      queryClient.invalidateQueries(["topics", selectedSubject?._id]),
  });
  const deleteTopicM = useMutation(deleteTopic, {
    onSuccess: () =>
      queryClient.invalidateQueries(["topics", selectedSubject?._id]),
  });

  // Problem CRUD
  const { data: probData = { data: [] } } = useQuery(
    ["problems", selectedTopic?._id],
    () => getProblems({ topic: selectedTopic?._id }),
    { enabled: !!selectedTopic && user?.role === "admin" }
  );
  const createProb = useMutation(createProblem, {
    onSuccess: () =>
      queryClient.invalidateQueries(["problems", selectedTopic?._id]),
  });
  const updateProb = useMutation(({ id, data }) => updateProblem(id, data), {
    onSuccess: () =>
      queryClient.invalidateQueries(["problems", selectedTopic?._id]),
  });
  const deleteProb = useMutation(deleteProblem, {
    onSuccess: () =>
      queryClient.invalidateQueries(["problems", selectedTopic?._id]),
  });

  // User dashboard data
  const { data, isLoading, isError } = useQuery(
    ["userDashboard"],
    getUserDashboard,
    {
      enabled: !!user,
      // avoid frequent automatic refetches during dev/strict mode or when window focuses
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
  const dash = data?.data?.data;
  const subjects = Array.isArray(dash?.subjects) ? dash.subjects : [];

  // State for expanding subject/topic
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);

  // Load problems for selected subject
  const { data: subjectProblemsData, isLoading: problemsLoading } = useQuery(
    ["problemsBySubject", activeSubjectId],
    () => getProblems({ subject: activeSubjectId }),
    { enabled: !!activeSubjectId }
  );
  const subjectProblems =
    subjectProblemsData?.data?.data || subjectProblemsData?.data || [];

  // Group by topic for rendering
  const problemsByTopic = useMemo(() => {
    return subjectProblems.reduce((acc, p) => {
      const key = String(p.topic?._id || p.topic);
      acc[key] = acc[key] || [];
      acc[key].push(p);
      return acc;
    }, {});
  }, [subjectProblems]);

  // Save attempt + response panel
  const saveAttempt = useMutation((payload) => saveExerciseAttempt(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries(["userDashboard"]);
      queryClient.invalidateQueries(["userProgressList"]);
    },
  });

  // mutation to toggle topic completion (per-user) using UserExerciseProgress
  const toggleTopic = useMutation(
    ({ topicId }) => toggleTopicCompletion(topicId),
    {
      onSuccess: () => queryClient.invalidateQueries(["userDashboard"]),
    }
  );

  // mutation to set user's current topic (auto-called when opening a topic)
  const setCurrentTopic = useMutation(
    ({ topicId }) => updateUserCurrentTopic(null, topicId),
    {
      onSuccess: () => queryClient.invalidateQueries(["userDashboard"]),
    }
  );

  const { data: progressListData } = useQuery(
    ["userProgressList"],
    getUserProgress,
    { enabled: !!user, refetchOnWindowFocus: false }
  );
  const progressList = progressListData?.data?.data || [];

  // Progress summary (aggregated percentages per subject/topic)
  const { data: progressSummaryData } = useQuery(
    ["progress", "summary"],
    getProgressSummary,
    {
      enabled: !!user,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
    }
  );
  const progressSummary = progressSummaryData?.data || { subjects: [] };

  if (!user) return <div className="max-w-xl mx-auto py-8">Please log in.</div>;

  if (user.role === "admin") {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="mb-6">
          <a
            href="/subjects/manage"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mr-3"
          >
            Go to Subject Management
          </a>
          <a
            href="/admin/submissions"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            View All Submissions
          </a>
        </div>
        {/* Admin Stats */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">System Statistics</h2>
          {statsLoading ? (
            <div>Loading stats...</div>
          ) : statsError ? (
            <div>Error loading stats.</div>
          ) : (
            <ul className="mb-2">
              <li>
                Number of users:{" "}
                <b>{adminStats?.data?.data?.userCount ?? "-"}</b>
              </li>
              <li>
                Number of subjects:{" "}
                <b>{adminStats?.data?.data?.subjectCount ?? "-"}</b>
              </li>
            </ul>
          )}
        </section>
        {/* Assign Subjects to Users Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Assign Subjects to Users
          </h2>
          <form
            className="flex flex-wrap gap-2 mb-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const userId = e.target.user.value;
              const subjectId = e.target.subject.value;
              assignSubject.mutate({ userId, subjectId });
              e.target.reset();
            }}
          >
            <select name="user" className="border px-2 py-1 rounded" required>
              <option value="">
                {usersLoading ? "Loading users..." : "Select User"}
              </option>
              {usersError && <option disabled>Error loading users</option>}
              {Array.isArray(userData) &&
                userData.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.username || u.email}
                  </option>
                ))}
            </select>
            <select
              name="subject"
              className="border px-2 py-1 rounded"
              required
            >
              <option value="">
                {subjectsLoading ? "Loading subjects..." : "Select Subject"}
              </option>
              {subjectsError && (
                <option disabled>Error loading subjects</option>
              )}
              {subjectsList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button className="bg-green-500 text-white px-3 py-1 rounded">
              Assign
            </button>
          </form>
          {/* Remove assignment */}
          <form
            className="flex flex-wrap gap-2 mb-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const userId = e.target.user.value;
              const subjectId = e.target.subject.value;
              removeSubject.mutate({ userId, subjectId });
              e.target.reset();
            }}
          >
            <select name="user" className="border px-2 py-1 rounded" required>
              <option value="">
                {usersLoading ? "Loading users..." : "Select User"}
              </option>
              {usersError && <option disabled>Error loading users</option>}
              {Array.isArray(userData) &&
                userData.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.username || u.email}
                  </option>
                ))}
            </select>
            <select
              name="subject"
              className="border px-2 py-1 rounded"
              required
            >
              <option value="">
                {subjectsLoading ? "Loading subjects..." : "Select Subject"}
              </option>
              {subjectsError && (
                <option disabled>Error loading subjects</option>
              )}
              {subjectsList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button className="bg-red-500 text-white px-3 py-1 rounded">
              Remove
            </button>
          </form>
        </section>
        {/* Category Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          <form
            className="flex gap-2 mb-2"
            onSubmit={(e) => {
              e.preventDefault();
              createCat.mutate({ name: e.target.name.value });
              e.target.reset();
            }}
          >
            <input
              name="name"
              className="border px-2 py-1 rounded"
              placeholder="New category"
              required
            />
            <button className="bg-blue-500 text-white px-3 py-1 rounded">
              Add
            </button>
          </form>
          <ul>
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center gap-2 mb-1">
                <button
                  className={`underline ${
                    selectedCategory?._id === cat._id
                      ? "font-bold text-blue-700"
                      : "text-blue-500"
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSubject(null);
                    setSelectedTopic(null);
                  }}
                >
                  {cat.name}
                </button>
                <button
                  className="text-xs text-red-500"
                  onClick={() => deleteCat.mutate(cat._id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
        {/* Subject Section */}
        {selectedCategory && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              Subjects in {selectedCategory.name}
            </h2>
            <form
              className="flex gap-2 mb-2"
              onSubmit={(e) => {
                e.preventDefault();
                createSubj.mutate({
                  name: e.target.name.value,
                  category: selectedCategory._id,
                });
                e.target.reset();
              }}
            >
              <input
                name="name"
                className="border px-2 py-1 rounded"
                placeholder="New subject"
                required
              />
              <button className="bg-blue-500 text-white px-3 py-1 rounded">
                Add
              </button>
            </form>
            <ul>
              {subjData.data.map((subj) => (
                <li key={subj._id} className="flex items-center gap-2 mb-1">
                  <button
                    className={`underline ${
                      selectedSubject?._id === subj._id
                        ? "font-bold text-blue-700"
                        : "text-blue-500"
                    }`}
                    onClick={() => {
                      setSelectedSubject(subj);
                      setSelectedTopic(null);
                    }}
                  >
                    {subj.name}
                  </button>
                  <button
                    className="text-xs text-red-500"
                    onClick={() => deleteSubj.mutate(subj._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* Topic Section */}
        {selectedSubject && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              Topics in {selectedSubject.name}
            </h2>
            <form
              className="flex gap-2 mb-2"
              onSubmit={(e) => {
                e.preventDefault();
                createTopicM.mutate({
                  name: e.target.name.value,
                  subject: selectedSubject._id,
                });
                e.target.reset();
              }}
            >
              <input
                name="name"
                className="border px-2 py-1 rounded"
                placeholder="New topic"
                required
              />
              <button className="bg-blue-500 text-white px-3 py-1 rounded">
                Add
              </button>
            </form>
            <ul>
              {topicData.data.map((topic) => (
                <li key={topic._id} className="flex items-center gap-2 mb-1">
                  <Link
                    to={`/explore/topic/${topic._id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {topic.name}
                  </Link>
                  <button
                    className="text-xs text-red-500"
                    onClick={() => deleteTopicM.mutate(topic._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* Problem Section */}
        {selectedTopic && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              Problems in {selectedTopic.name}
            </h2>
            <form
              className="flex gap-2 mb-2"
              onSubmit={(e) => {
                e.preventDefault();
                createProb.mutate({
                  title: e.target.title.value,
                  topic: selectedTopic._id,
                  description: e.target.description.value,
                  difficulty: e.target.difficulty.value,
                  link: e.target.link.value,
                });
                e.target.reset();
              }}
            >
              <input
                name="title"
                className="border px-2 py-1 rounded"
                placeholder="Title"
                required
              />
              <input
                name="description"
                className="border px-2 py-1 rounded"
                placeholder="Description"
              />
              <select name="difficulty" className="border px-2 py-1 rounded">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <input
                name="link"
                className="border px-2 py-1 rounded"
                placeholder="Link"
              />
              <button className="bg-blue-500 text-white px-3 py-1 rounded">
                Add
              </button>
            </form>
            <ul>
              {probData.data.map((prob) => (
                <li key={prob._id} className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{prob.title}</span>
                  <span className="text-xs text-gray-500">
                    {prob.difficulty}
                  </span>
                  <button
                    className="text-xs text-red-500"
                    onClick={() => deleteProb.mutate(prob._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // Regular user dashboard
  if (isLoading)
    return <div className="max-w-xl mx-auto py-8">Loading dashboard...</div>;
  if (isError)
    return (
      <div className="max-w-xl mx-auto py-8">Error loading dashboard.</div>
    );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>

      {/* Assigned Subjects & Study */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">My Courses</h2>
        {subjects.length === 0 ? (
          <div className="text-gray-600">No assigned subjects.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {subjects.map((subj) => (
              <div
                key={subj._id}
                className={`rounded-lg border shadow-sm bg-white ${
                  dash?.currentTopic &&
                  subj.topics &&
                  subj.topics.some((t) => t._id === dash.currentTopic._id)
                    ? "ring-2 ring-green-300"
                    : ""
                }`}
              >
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">{subj.name}</div>
                    {progressSummary.subjects && (
                      <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                        <span className="text-xs text-gray-500">Overall</span>
                        <div className="w-40 bg-gray-200 rounded overflow-hidden">
                          <div
                            className="bg-green-500 h-2"
                            style={{
                              width: `${
                                progressSummary.subjects.find(
                                  (s) => s._id === subj._id
                                )?.percentCompleted || 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs">
                          {Math.round(
                            progressSummary.subjects.find(
                              (s) => s._id === subj._id
                            )?.percentCompleted || 0
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    className="text-blue-600 hover:text-blue-700 underline"
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
                  <div className="border-t p-4">
                    {/* Topics list with content */}
                    <ul className="space-y-3">
                      {(subj.topics || []).map((t) => (
                        <li
                          key={t._id}
                          className={`rounded border p-3 ${
                            t.userCompleted ? "bg-green-50" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <Link
                                  to={`/explore/topic/${t._id}`}
                                  className={
                                    (dash?.currentTopic &&
                                    dash.currentTopic._id === t._id
                                      ? "font-bold text-indigo-700"
                                      : "") + " hover:underline"
                                  }
                                  onClick={() =>
                                    setCurrentTopic.mutate({ topicId: t._id })
                                  }
                                >
                                  {t.name}
                                </Link>
                                {dash?.currentTopic &&
                                  dash.currentTopic._id === t._id && (
                                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                                      Current
                                    </span>
                                  )}
                              </div>
                              {t.content && (
                                <div
                                  className="mt-1 text-sm text-gray-700 w-full overflow-hidden text-ellipsis line-clamp-3"
                                  dangerouslySetInnerHTML={{
                                    __html: t.content,
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <button
                                className="text-sm text-blue-600 hover:text-blue-700 underline"
                                onClick={() => {
                                  const newTid =
                                    activeTopicId === t._id ? null : t._id;
                                  setActiveTopicId(newTid);
                                  if (newTid) {
                                    // automatically set current topic when opening
                                    setCurrentTopic.mutate({ topicId: t._id });
                                  }
                                }}
                              >
                                {activeTopicId === t._id
                                  ? "Hide Exercises"
                                  : "View Exercises"}
                              </button>
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={!!t.userCompleted}
                                    onChange={() =>
                                      toggleTopic.mutate({ topicId: t._id })
                                    }
                                    className="w-4 h-4"
                                  />
                                  <span className="text-xs">Completed</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {activeTopicId === t._id && (
                            <div className="mt-3">
                              {problemsLoading ? (
                                <div>Loading exercises...</div>
                              ) : (
                                <div className="space-y-2">
                                  {(problemsByTopic[String(t._id)] || []).map(
                                    (p) => (
                                      <ExerciseRow
                                        key={p._id}
                                        exercise={p}
                                        onSubmit={(payload) =>
                                          saveAttempt.mutate(payload)
                                        }
                                      />
                                    )
                                  )}
                                  {(!problemsByTopic[String(t._id)] ||
                                    problemsByTopic[String(t._id)].length ===
                                      0) && (
                                    <div className="text-sm text-gray-500">
                                      No exercises yet.
                                    </div>
                                  )}
                                </div>
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
      </section>

      {/* Recent attempts panel (live response) */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Your Attempts</h2>
        {progressList.length === 0 ? (
          <div className="text-gray-600">
            No attempts yet. Try saving an exercise above.
          </div>
        ) : (
          <div className="rounded-lg border bg-white">
            <ul className="divide-y">
              {progressList.map((pr) => (
                <li
                  key={pr._id}
                  className="p-3 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="font-medium">
                      {pr.exercise?.title || "Exercise"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Topic: {pr.exercise?.topic?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Status: {pr.status}
                    </div>
                    {pr.answer && (
                      <div className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                        {pr.answer}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(pr.updatedAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};

// ExerciseRow component used in the dashboard exercises list
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
              className="text-blue-600 underline text-sm mr-2"
            >
              Resource
            </a>
          )}
          {exercise.leetcodeLink && (
            <a
              href={exercise.leetcodeLink}
              target="_blank"
              rel="noreferrer"
              className="text-purple-600 underline text-sm mr-2"
            >
              LeetCode
            </a>
          )}
          {exercise.ytLink && (
            <a
              href={exercise.ytLink}
              target="_blank"
              rel="noreferrer"
              className="text-red-600 underline text-sm mr-2"
            >
              YouTube
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

export default Dashboard;
