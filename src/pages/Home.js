import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to the COURSESheet</h1>
      <p className="text-lg mb-8">
        Your one-stop solution for mastering Data Structures and Algorithms.
      </p>

      <div className="max-w-3xl w-full bg-white rounded shadow p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-3">Key Features</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>User & Admin dashboards</strong> — personalized study
            dashboard for learners and management tools for admins.
          </li>
          <li>
            <strong>Google OAuth + JWT auth</strong> — secure sign-in and
            token-based API access.
          </li>
          <li>
            <strong>Full CRUD</strong> for Categories, Subjects, Topics and
            Problems (admin).
          </li>
          <li>
            <strong>Explore flow</strong> — browse Categories → Subjects →
            Topics → Problems and open topic pages.
          </li>
          <li>
            <strong>Inline exercise attempts</strong> — save answers, mark
            attempted/completed; per-user attempts stored and shown in your
            dashboard.
          </li>
          <li>
            <strong>Per-user progress</strong> — progress summaries by topic and
            subject; toggle topic completion for your account.
          </li>
          <li>
            <strong>Current topic tracking</strong> — the app tracks the topic
            you're studying and highlights it in the UI.
          </li>
          <li>
            <strong>Rich content</strong> — topics support rich text content and
            problem entries can include Resource, LeetCode and YouTube links.
          </li>
          <li>
            <strong>Admin submissions view</strong> — admins can browse and
            filter all user submissions by user, subject or topic.
          </li>
        </ul>
      </div>

      <Link
        to="/dashboard"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default Home;
