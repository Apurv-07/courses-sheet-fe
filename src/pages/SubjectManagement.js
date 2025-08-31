// SubjectManagement.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import RichTextEditor from "../components/RichTextEditor";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  createTopic,
  updateTopic,
  deleteTopic,
  getProblems, // Exercises
  createProblem, // Create Exercise
  updateProblem, // Update Exercise
  deleteProblem, // Delete Exercise
  getCategories,
} from "../api/apiClient";

/** -------------------- helpers -------------------- */
function pickArray(maybe) {
  // supports: [], {data: []}, {data: {data: []}}
  if (Array.isArray(maybe)) return maybe;
  if (maybe?.data && Array.isArray(maybe.data)) return maybe.data;
  if (maybe?.data?.data && Array.isArray(maybe.data.data))
    return maybe.data.data;
  return [];
}

/** -------------------- small forms -------------------- */
function ExerciseForm({ exercise, onSave, onCancel }) {
  const [form, setForm] = useState(
    exercise || { name: "", link: "", description: "", difficulty: "Easy" }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-x-2 flex flex-wrap items-center gap-2"
    >
      <input
        className="border px-2 py-1 rounded"
        placeholder="Exercise Name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        required
      />
      <input
        className="border px-2 py-1 rounded"
        placeholder="Link (optional)"
        value={form.link}
        onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
      />
      <input
        className="border px-2 py-1 rounded"
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) =>
          setForm((f) => ({ ...f, description: e.target.value }))
        }
      />
      <select
        className="border px-2 py-1 rounded"
        value={form.difficulty}
        onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
      >
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>
      <button
        type="submit"
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="bg-gray-300 px-3 py-1 rounded"
      >
        Cancel
      </button>
    </form>
  );
}

function TopicForm({ topic, onSave, onCancel }) {
  const [form, setForm] = useState(topic || { name: "", content: "" });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="bg-gray-100 p-3 rounded space-y-2"
    >
      <input
        className="border px-2 py-1 rounded w-full"
        placeholder="Topic Name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        required
      />
      <div className="bg-white rounded border">
        <RichTextEditor
          value={form.content}
          onChange={(val) => setForm((f) => ({ ...f, content: val }))}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/** -------------------- Exercises (Problems) -------------------- */
function ExerciseManager({ topic, onClose }) {
  const qc = useQueryClient();
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);

  const {
    data: problemsData,
    isLoading: problemsLoading,
    isError,
  } = useQuery(
    ["problems", topic._id],
    () => getProblems({ topic: topic._id }),
    {
      keepPreviousData: true,
    }
  );

  const problems = pickArray(problemsData);

  const createExerciseMutation = useMutation(
    (payload) =>
      createProblem({
        title: payload.name,
        description: payload.description,
        link: payload.link,
        difficulty: payload.difficulty,
        topic: topic._id,
      }),
    {
      onSuccess: () => {
        qc.invalidateQueries(["problems", topic._id]);
        qc.invalidateQueries(["subjects"]);
        setShowExerciseForm(false);
      },
    }
  );

  const updateExerciseMutation = useMutation(
    ({ id, ...payload }) =>
      updateProblem(id, {
        title: payload.name,
        description: payload.description,
        link: payload.link,
        difficulty: payload.difficulty,
      }),
    {
      onSuccess: () => {
        qc.invalidateQueries(["problems", topic._id]);
        qc.invalidateQueries(["subjects"]);
        setEditingExercise(null);
      },
    }
  );

  const deleteExerciseMutation = useMutation((id) => deleteProblem(id), {
    onSuccess: () => {
      qc.invalidateQueries(["problems", topic._id]);
      qc.invalidateQueries(["subjects"]);
    },
  });

  return (
    <div className="bg-gray-50 p-3 mt-2 rounded border">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Exercises for {topic.name}</span>
        <button onClick={onClose} className="text-red-600">
          Close
        </button>
      </div>

      <button
        className="bg-blue-600 text-white px-3 py-1 rounded mb-3"
        onClick={() => setShowExerciseForm((f) => !f)}
      >
        {showExerciseForm ? "Cancel" : "Add Exercise"}
      </button>

      {showExerciseForm && (
        <ExerciseForm
          onSave={(data) => createExerciseMutation.mutate(data)}
          onCancel={() => setShowExerciseForm(false)}
        />
      )}

      {problemsLoading ? (
        <div>Loading exercises...</div>
      ) : isError ? (
        <div className="text-red-600">Failed to load exercises.</div>
      ) : (
        <ul className="space-y-2">
          {problems.map((ex) => (
            <li
              key={ex._id}
              className="flex items-center justify-between bg-white border p-2 rounded"
            >
              {editingExercise === ex._id ? (
                <ExerciseForm
                  exercise={{
                    name: ex.title || "",
                    description: ex.description || "",
                    link: ex.link || "",
                    difficulty: ex.difficulty || "Easy",
                  }}
                  onSave={(data) =>
                    updateExerciseMutation.mutate({ id: ex._id, ...data })
                  }
                  onCancel={() => setEditingExercise(null)}
                />
              ) : (
                <>
                  <span className="truncate">
                    <strong>{ex.title}</strong>
                    {ex.description && (
                      <span className="ml-2 text-xs text-gray-600">
                        {ex.description}
                      </span>
                    )}
                    {ex.link && (
                      <a
                        href={ex.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline ml-2"
                      >
                        [Link]
                      </a>
                    )}
                    {ex.difficulty && (
                      <span className="ml-2 text-xs text-gray-600">
                        {ex.difficulty}
                      </span>
                    )}
                  </span>
                  <div className="shrink-0">
                    <button
                      className="bg-yellow-400 px-2 py-1 rounded mr-2"
                      onClick={() => setEditingExercise(ex._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => deleteExerciseMutation.mutate(ex._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** -------------------- Topics -------------------- */
function TopicManager({ subject, onClose }) {
  const qc = useQueryClient();
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [openTopicId, setOpenTopicId] = useState(null); // which topic's exercises are open

  const createTopicMutation = useMutation(
    (payload) => createTopic({ ...payload, subject: subject._id }),
    {
      onSuccess: () => {
        qc.invalidateQueries(["subjects"]);
        setShowTopicForm(false);
      },
    }
  );

  const updateTopicMutation = useMutation(
    ({ id, ...payload }) => updateTopic({ id, ...payload }),
    {
      onSuccess: () => {
        qc.invalidateQueries(["subjects"]);
        setEditingTopicId(null);
      },
    }
  );

  const deleteTopicMutation = useMutation((topicId) => deleteTopic(topicId), {
    onSuccess: () => qc.invalidateQueries(["subjects"]),
  });

  return (
    <div className="bg-gray-100 p-3 mt-2 rounded border">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Topics for {subject.name}</span>
        <button onClick={onClose} className="text-red-600">
          Close
        </button>
      </div>

      <button
        className="bg-blue-600 text-white px-3 py-1 rounded mb-2"
        onClick={() => setShowTopicForm((f) => !f)}
      >
        {showTopicForm ? "Cancel" : "Add Topic"}
      </button>

      {showTopicForm && (
        <TopicForm
          onSave={(payload) => createTopicMutation.mutate(payload)}
          onCancel={() => setShowTopicForm(false)}
        />
      )}

      <ul className="space-y-2">
        {(subject.topics || []).map((topic) => (
          <li key={topic._id} className="border rounded p-2 bg-white">
            {editingTopicId === topic._id ? (
              <TopicForm
                topic={{ name: topic.name, content: topic.content || "" }}
                onSave={(payload) =>
                  updateTopicMutation.mutate({ id: topic._id, ...payload })
                }
                onCancel={() => setEditingTopicId(null)}
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{topic.name}</span>
                  <div>
                    <button
                      className="bg-yellow-400 px-2 py-1 rounded mr-2"
                      onClick={() => setEditingTopicId(topic._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => deleteTopicMutation.mutate(topic._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                      onClick={() =>
                        setOpenTopicId((id) =>
                          id === topic._id ? null : topic._id
                        )
                      }
                    >
                      {openTopicId === topic._id
                        ? "Hide Exercises"
                        : "Manage Exercises"}
                    </button>
                  </div>
                </div>

                {topic.content && (
                  <div
                    className="mt-2 p-2 bg-gray-50 border rounded"
                    dangerouslySetInnerHTML={{ __html: topic.content }}
                  />
                )}
              </>
            )}

            {openTopicId === topic._id && (
              <ExerciseManager
                topic={topic}
                onClose={() => setOpenTopicId(null)}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** -------------------- Subjects (root) -------------------- */
export default function SubjectManagement() {
  const qc = useQueryClient();

  // Subjects
  const {
    data: subjectsRaw,
    isLoading,
    isError,
  } = useQuery(["subjects"], getSubjects, {
    staleTime: 10_000,
  });
  const subjects = pickArray(subjectsRaw);

  // Categories
  const {
    data: catRaw,
    isLoading: catLoading,
    isError: catError,
  } = useQuery(["categories"], getCategories, { staleTime: 60_000 });
  const categories = pickArray(catRaw);

  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ name: "", category: "" });
  const [openSubjectId, setOpenSubjectId] = useState(null);

  const createSubjectMutation = useMutation(
    (payload) => createSubject(payload),
    {
      onSuccess: (created) => {
        qc.invalidateQueries(["subjects"]);
        setShowSubjectForm(false);
        setSubjectForm({ name: "", category: "" });
        // Auto-open the new subject's topics list
        const newSubject = created?.data?._id ? created.data : created;
        if (newSubject?._id) setOpenSubjectId(newSubject._id);
      },
    }
  );

  const updateSubjectMutation = useMutation(
    ({ id, ...payload }) => updateSubject({ id, ...payload }),
    {
      onSuccess: () => {
        qc.invalidateQueries(["subjects"]);
        setEditingSubjectId(null);
      },
    }
  );

  const deleteSubjectMutation = useMutation((id) => deleteSubject(id), {
    onSuccess: () => qc.invalidateQueries(["subjects"]),
  });

  if (isLoading) return <div>Loading subjects...</div>;
  if (isError)
    return <div className="text-red-600">Error loading subjects.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Subject Management</h2>

      <button
        className="bg-blue-600 text-white px-3 py-1 rounded mb-4"
        onClick={() => setShowSubjectForm((f) => !f)}
      >
        {showSubjectForm ? "Cancel" : "Add Subject"}
      </button>

      {showSubjectForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!subjectForm.category) {
              alert("Please select a category");
              return;
            }
            createSubjectMutation.mutate(subjectForm);
          }}
          className="mb-4 flex flex-wrap items-center gap-2"
        >
          <input
            className="border px-2 py-1 rounded"
            placeholder="Subject Name"
            value={subjectForm.name}
            onChange={(e) =>
              setSubjectForm((f) => ({ ...f, name: e.target.value }))
            }
            required
          />
          <select
            className="border px-2 py-1 rounded"
            value={subjectForm.category}
            onChange={(e) =>
              setSubjectForm((f) => ({ ...f, category: e.target.value }))
            }
            required
          >
            <option value="">
              {catLoading ? "Loading categories..." : "Select Category"}
            </option>
            {catError && <option disabled>Error loading categories</option>}
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Create
          </button>
        </form>
      )}

      <ul className="space-y-3">
        {subjects.map((subject) => {
          const isEditing = editingSubjectId === subject._id;
          const isOpen = openSubjectId === subject._id;

          return (
            <li key={subject._id} className="border rounded p-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{subject.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    className="bg-yellow-400 px-2 py-1 rounded"
                    onClick={() => {
                      setEditingSubjectId(subject._id);
                      setSubjectForm({
                        name: subject.name || "",
                        category:
                          subject.category?._id || subject.category || "",
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => deleteSubjectMutation.mutate(subject._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() =>
                      setOpenSubjectId((id) =>
                        id === subject._id ? null : subject._id
                      )
                    }
                  >
                    {isOpen ? "Hide Topics" : "Manage Topics"}
                  </button>
                </div>
              </div>

              {isEditing && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateSubjectMutation.mutate({
                      id: subject._id,
                      ...subjectForm,
                    });
                  }}
                  className="mt-2 flex flex-wrap items-center gap-2"
                >
                  <input
                    className="border px-2 py-1 rounded"
                    value={subjectForm.name}
                    onChange={(e) =>
                      setSubjectForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                  <select
                    className="border px-2 py-1 rounded"
                    value={subjectForm.category}
                    onChange={(e) =>
                      setSubjectForm((f) => ({
                        ...f,
                        category: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">
                      {catLoading ? "Loading categories..." : "Select Category"}
                    </option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSubjectId(null)}
                    className="bg-gray-300 px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {isOpen && (
                <TopicManager
                  subject={subject}
                  onClose={() => setOpenSubjectId(null)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
