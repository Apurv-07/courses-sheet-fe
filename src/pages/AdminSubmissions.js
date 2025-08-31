import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/apiClient";

const AdminSubmissions = () => {
  const [filters, setFilters] = React.useState({
    user: "",
    subject: "",
    topic: "",
  });
  const [page, setPage] = React.useState(1);
  const queryClient = useQueryClient();

  const fetcher = async ({ queryKey }) => {
    const [_key, { filters, page }] = queryKey;
    const params = { ...filters, page };
    const res = await api.get("/progress/all", {
      params,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  };

  const { data, isLoading, isError } = useQuery(
    ["adminSubmissions", { filters, page }],
    fetcher,
    { keepPreviousData: true }
  );

  if (isLoading) return <div>Loading submissions...</div>;
  if (isError) return <div>Error loading submissions.</div>;

  const submissions = data?.data?.submissions || [];
  const pagination = data?.data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All User Submissions</h1>

      <div className="mb-4 flex gap-2 items-center">
        <input
          placeholder="User (username or email or id)"
          aria-label="Filter by user name or id"
          value={filters.user}
          onChange={(e) => setFilters({ ...filters, user: e.target.value })}
          className="border px-2 py-1 rounded"
        />
        <input
          placeholder="Subject (name or id)"
          aria-label="Filter by subject name or id"
          value={filters.subject}
          onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
          className="border px-2 py-1 rounded"
        />
        <input
          placeholder="Topic (name or id)"
          aria-label="Filter by topic name or id"
          value={filters.topic}
          onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
          className="border px-2 py-1 rounded"
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={() => {
            setPage(1);
            queryClient.invalidateQueries([
              "adminSubmissions",
              { filters, page: 1 },
            ]);
          }}
        >
          Apply
        </button>
      </div>

      <div className="space-y-3">
        {submissions.map((s) => (
          <div key={s._id} className="border rounded p-3 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{s.exercise?.title}</div>
                <div className="text-xs text-gray-500">
                  Topic: {s.exercise?.topic?.name}
                </div>
                <div className="text-xs text-gray-500">
                  Subject: {s.exercise?.topic?.subject?.name}
                </div>
                <div className="text-xs text-gray-500">
                  Category: {s.exercise?.topic?.subject?.category?.name}
                </div>
              </div>
              <div className="text-right text-xs">
                <div>{s.user?.username || s.user?.email}</div>
                <div className="text-gray-500">
                  {new Date(s.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-2">
              Status: <b>{s.status}</b>
            </div>
            {s.answer && (
              <div className="mt-2 whitespace-pre-line">{s.answer}</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          className="px-3 py-1 border rounded"
          disabled={pagination.page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <div className="text-sm">
          Page {pagination.page} / {pagination.totalPages}
        </div>
        <button
          className="px-3 py-1 border rounded"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminSubmissions;
