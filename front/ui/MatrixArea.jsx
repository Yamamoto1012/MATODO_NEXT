"use client";
import { useEffect, useState } from "react";
import { db } from "../app/firebase";
import { collection, getDocs, query } from "firebase/firestore";

export function MatrixArea() {
  // firebaseのtasksテーブルからタスクを取得
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksCollectionRef = collection(db, "tasks");
      const q = query(tasksCollectionRef);
      const querySnapshot = await getDocs(q);
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
    };
    fetchTasks();
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

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4 p-6 mx-auto mt-12 rounded-xl shadow-xl w-[600px] h-[400px] md:w-[725px] md:h-[525px] lg:w-[800px] lg:h-[600px]">

      {/* 緊急ではないが重要 */}
      <div className="bg-gradient-to-tr from-green-500 to-green-300 flex flex-col justify-center items-center rounded-lg shadow-md overflow-y-auto p-2">
        <p className="text-white text-2xl font-semibold mb-2">
          緊急ではないが重要
        </p>
        {notUrgentImportantTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white text-black p-2 rounded-lg shadow m-1"
          >
            {task.title}
          </div>
        ))}
      </div>

      {/* 緊急で重要 */}
      <div className="bg-gradient-to-tr from-red-500 to-pink-400 flex flex-col justify-center items-center rounded-lg shadow-md overflow-y-auto p-2">
        <p className="text-white text-2xl font-semibold mb-2">緊急で重要</p>
        {urgentImportantTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white text-black p-2 rounded-lg shadow m-1"
          >
            {task.title}
          </div>
        ))}
      </div>  

      {/* 緊急でも重要でもない */}
      <div className="bg-gradient-to-tr from-gray-500 to-gray-300 flex flex-col justify-center items-center rounded-lg shadow-md overflow-y-auto p-2">
        <p className="text-white text-2xl font-semibold mb-2">
          緊急でも重要でもない
        </p>
        {notUrgentNotImportantTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white text-black p-2 rounded-lg shadow m-1"
          >
            {task.title}
          </div>
        ))}
      </div>

      {/* 緊急だが重要ではない */}
      <div className="bg-gradient-to-tr from-blue-500 to-blue-300 flex flex-col justify-center items-center rounded-lg shadow-md overflow-y-auto p-2">
        <p className="text-white text-2xl font-semibold mb-2">
          緊急だが重要ではない
        </p>
        {urgentNotImportantTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white text-black p-2 rounded-lg shadow m-1"
          >
            {task.title}
          </div>
        ))}
      </div>

    </div>
  );
}

export default MatrixArea;
