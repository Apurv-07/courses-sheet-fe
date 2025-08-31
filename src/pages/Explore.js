import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import { getSubjects, assignSubjectToUser } from "../api/apiClient";

const Explore = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  console.log("Explore page user:", user);
  const history = useHistory();
  const queryClient = useQueryClient();
  const { data: subjData, isLoading: subjLoading } = useQuery(
    ["subjects"],
    () => getSubjects({})
  );
  let subjects = [];
  if (subjData) {
    if (Array.isArray(subjData.data?.data)) subjects = subjData.data.data;
    else if (Array.isArray(subjData.subjects)) subjects = subjData.subjects;
  }

  const [selectedSubject, setSelectedSubject] = useState(null);
  const assignSubject = useMutation(
    ({ userId, subjectId }) => assignSubjectToUser(userId, subjectId),
    {
      onSuccess: (data) => {
        const updatedUser = data.data.data; // assuming API returns updated user
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      },
    }
  );

  const assignedIds = new Set(
    (user?.assignedSubjects || []).map((s) =>
      typeof s === "string" ? s : s._id
    )
  );
  // const [selectedTopic, setSelectedTopic] = useState(null);

  // Drill-down: Topic view
  // if (selectedTopic) {
  //   return (
  //     <TopicExercises
  //       topic={selectedTopic}
  //       onBack={() => setSelectedTopic(null)}
  //     />
  //   );
  // }

  // Drill-down: Subject view
  if (selectedSubject) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <button
          className="mb-4 text-blue-600"
          onClick={() => setSelectedSubject(null)}
        >
          ← Back to Courses
        </button>
        <h2 className="text-2xl font-bold mb-4">
          {selectedSubject.name} Topics
        </h2>
        <ul>
          {selectedSubject.topics?.map((topic) => (
            <li key={topic._id} className="mb-2">
              {/* <button
                className="text-blue-700 underline"
                onClick={() => setSelectedTopic(topic)}
              > */}
              {topic.name}
              {/* </button> */}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Group subjects by category
  const grouped = {};
  subjects.forEach((subj) => {
    const cat = subj.category?.name || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(subj);
  });

  const assignCourse = (subjectId) => {
    if (!user) {
      history.push("/login");
    } else {
      const userId = user._id;
      assignSubject.mutate({ userId, subjectId });
    }
  };

  // Main grid view
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Discover Courses</h1>
      {subjLoading ? (
        <div>Loading courses...</div>
      ) : (
        <div className="space-y-10 px-10">
          {Object.keys(grouped).map((cat) => (
            <div key={cat}>
              <h2 className="text-xl font-semibold mb-4">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {grouped[cat].map((subj) => (
                  <div
                    key={subj._id}
                    className="bg-white rounded shadow p-5 flex flex-col cursor-pointer hover:bg-blue-50"
                  >
                    <div onClick={() => setSelectedSubject(subj)}>
                      <div className="text-lg font-bold mb-2">{subj.name}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {subj.topics?.length || 0} Topics
                      </div>
                    </div>
                    {user && assignedIds.has(subj._id) ? (
                      <div className="mt-4 text-green-600">Assigned</div>
                    ) : (
                      <>
                        {user.role == "user" && (
                          <button
                            onClick={() => assignCourse(subj._id)}
                            className="mt-4 bg-blue-600 text-white px-3 py-1 rounded-md"
                          >
                            Assign Course
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// function TopicExercises({ topic, onBack }) {
//   const { data, isLoading } = useQuery(["problems", topic._id], () =>
//     getProblems({ topic: topic._id })
//   );
//   const problems = Array.isArray(data?.data) ? data.data : [];
//   const { data: progressData } = useQuery(["progress"], getUserProgress);
//   console.log("User progress data:", progressData, problems);

//   return (
//     <div className="max-w-3xl mx-auto py-8">
//       <button className="mb-4 text-blue-600" onClick={onBack}>
//         ← Back to Topics
//       </button>
//       <h2 className="text-2xl font-bold mb-4">{topic.name} Exercises</h2>
//       {isLoading ? (
//         <div>Loading exercises...</div>
//       ) : problems.length === 0 ? (
//         <div>No exercises found for this topic.</div>
//       ) : (
//         <ul>
//           {problems.map((ex) => (
//             <li key={ex._id} className="mb-4 border-b pb-2">
//               <ExerciseDetail exercise={ex} progressData={progressData} />
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

// // Inline Exercise interaction
// function ExerciseDetail({ exercise, progressData }) {
//   const queryClient = useQueryClient();
//   const [answer, setAnswer] = useState("");
//   const mutation = useMutation(saveExerciseAttempt, {
//     onSuccess: () => {
//       // refresh user's progress lists and aggregated summary + dashboard
//       queryClient.invalidateQueries(["progress"]);
//       queryClient.invalidateQueries(["progress", "summary"]);
//       queryClient.invalidateQueries(["userDashboard"]);
//     },
//   });

//   const userProgress = progressData?.find((p) => p.exercise === exercise._id);

//   return (
//     <div>
//       <div className="font-semibold">{exercise.title}</div>
//       <div className="mb-2 text-gray-700">{exercise.description}</div>
//       <input
//         className="border px-2 py-1 rounded mb-2"
//         type="text"
//         value={answer}
//         onChange={(e) => setAnswer(e.target.value)}
//         placeholder="Your answer"
//       />
//       <button
//         className="bg-green-600 text-white px-3 py-1 rounded ml-2"
//         onClick={() =>
//           mutation.mutate({
//             exerciseId: exercise._id,
//             answer,
//             status: "completed",
//           })
//         }
//         disabled={userProgress?.status === "completed"}
//       >
//         Mark as Completed
//       </button>
//       {userProgress?.status === "completed" && (
//         <span className="ml-2 text-green-600">Completed!</span>
//       )}
//     </div>
//   );
// }

export default Explore;
