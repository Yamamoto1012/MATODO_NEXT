"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../app/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Cached } from "@mui/icons-material";

export function MatrixArea() {
  // firebaseのtasksテーブルからタスクを取得
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const fetchTasks = async () => {
          const tasksCollectionRef = collection(db, "tasks");
          const q = query(
            tasksCollectionRef,
            where("userId", "==", user.uid), // ユーザーIDに基づくフィルタリング
            where("isDone", "==", false) // isDoneがfalseのもののみ取得
          );
          const querySnapshot = await getDocs(q);
          const tasksData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTasks(tasksData);
        };

        fetchTasks();
      }
    });
    return () => unsubscribe();
  }, []);

  // タスクをそれぞれのカテゴリに分ける
  const urgentImportantTasks = tasks.filter(
    (task) => task.urgency === "high" && task.importance === "high"
  );
  const urgentNotImportantTasks = tasks.filter(
    (task) => task.urgency === "high" && task.importance === "low"
  );
  const notUrgentImportantTasks = tasks.filter(
    (task) => task.urgency === "low" && task.importance === "high"
  );
  const notUrgentNotImportantTasks = tasks.filter(
    (task) => task.urgency === "low" && task.importance === "low"
  );
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4 p-6 mx-auto mt-12 rounded-xl shadow-xl w-[600px] h-[400px] md:w-[725px] md:h-[525px] lg:w-[800px] lg:h-[600px]">
      <button
        onClick={handleReload}
        className="absolute top-5 left-5 bg-gray-200 p-2 rounded-full shadow hover:bg-gray-300"
      >
        <Cached />
      </button>
      {/* 緊急ではないが重要 */}
      <div className="bg-gradient-to-tr from-green-500 to-green-300 flex flex-col justify-center items-center rounded-lg shadow-md overflow-y-auto p-2 transform transition-transform duration-300 ease-in-out hover:scale-105">
        <p className="text-white text-2xl font-semibold mb-2">
          緊急ではないが重要
        </p>
        {notUrgentImportantTasks.map((task) => (
          <div
            key={task.id}
            className="bg-[#2B2D42] text-white text-base px-3 py-2 rounded-lg shadow m-1"
          >
            {task.title}
          </div>
        ))}
      </div>

      {/* 緊急で重要 */}
      <div className="bg-gradient-to-tr from-red-500 to-pink-400 flex flex-col justify-center items-center rounded-lg shadow-md overflow-y-auto p-2 transform transition-transform duration-300 ease-in-out hover:scale-105">
        <p className="text-white text-2xl font-semibold mb-2">緊急で重要</p>
        {urgentImportantTasks.map((task) => (
          <div
            key={task.id}
            className="bg-[#2B2D42] text-white text-base px-3 py-2 rounded-lg shadow m-1"
          >
            {task.title}
          </div>
        ))}
      </div>

      {/* 緊急でも重要でもない */}
      <div className="bg-gradient-to-tr from-gray-500 to-gray-300 flex flex-col justify-center items-center rounded-lg shadow-md overflow-y-auto p-2 transform transition-transform duration-300 ease-in-out hover:scale-105">
        <p className="text-white text-2xl font-semibold mb-2">
          緊急でも重要でもない
        </p>
        {notUrgentNotImportantTasks.map((task) => (
          <div
            key={task.id}
            className="bg-[#2B2D42] text-white text-base px-3 py-2 rounded-lg shadow m-1"
          >
            {task.title}
          </div>
        ))}
      </div>

      {/* 緊急だが重要ではない */}
      <div className="bg-gradient-to-tr from-blue-500 to-blue-300 flex flex-col justify-center items-center rounded-lg shadow-md overflow-y-auto p-2 transform transition-transform duration-300 ease-in-out hover:scale-105">
        <p className="text-white text-2xl font-semibold mb-2">
          緊急だが重要ではない
        </p>
        {urgentNotImportantTasks.map((task) => (
          <div
            key={task.id}
            className="bg-[#2B2D42] text-white text-base px-3 py-2 rounded-lg shadow m-1"
          >
            {task.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatrixArea;
