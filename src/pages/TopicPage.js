import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/apiClient";

const fetchTopic = async ({ queryKey }) => {
  const [, id] = queryKey;
  const res = await api.get(`/topics/${id}`);
  return res.data;
};

const TopicPage = ({ match }) => {
  const topicId = match.params.topicId || match.params.id;
  const { data, isLoading, isError } = useQuery(
    ["topic", topicId],
    fetchTopic,
    { enabled: !!topicId }
  );
  if (isLoading) return <div>Loading topic...</div>;
  if (isError) return <div>Error loading topic.</div>;
  const topic = data?.data?.topic;
  const problems = data?.data?.problems || [];
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{topic?.name}</h1>
      <div
        className="mb-4 text-gray-700"
        dangerouslySetInnerHTML={{ __html: topic?.content }}
      />
      <h2 className="text-xl font-semibold mb-2">Problems</h2>
      <ul className="space-y-3">
        {problems.map((p) => (
          <li key={p._id} className="border rounded p-3 bg-white">
            <div className="font-semibold">{p.title}</div>
            <div className="text-xs text-gray-500">{p.difficulty}</div>
            <div className="mt-2">{p.description}</div>
            {p.leetcodeLink && (
              <a
                href={p.leetcodeLink}
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 underline mr-2"
              >
                LeetCode
              </a>
            )}
            {p.ytLink && (
              <a
                href={p.ytLink}
                target="_blank"
                rel="noreferrer"
                className="text-red-600 underline"
              >
                YouTube
              </a>
            )}
            {p.userProgress && (
              <div className="mt-2 text-sm text-gray-700">
                Your answer:{" "}
                <div className="whitespace-pre-line">
                  {p.userProgress.answer}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopicPage;
