"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../app/firebase";
import { query, collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function TaskCard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "tasks"));
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      let todosArr = [];
      QuerySnapshot.forEach((doc) => {
        todosArr.push({ ...doc.data(), id: doc.id });
      });
      const filteredTasks = todosArr.filter((task) => !task.isDone);
      setTasks(filteredTasks);
    });
    return () => unsubscribe();
  }, []);

  //checkboxが入力された時に、firebaseのtasksテーブルのtaskのisDoneをtrueにする
  const handleChange = async (taskId, isDone) => {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      isDone: isDone
    });
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`bg-[#2B2D42] rounded-[15px] shadow-md p-2 mx-1 flex items-center transition duration-500 ease-in-out`}
        >
          <div className="flex items-center h-4 w-4 ml-2 rounded-full border-none">
            <input
              type="checkbox"
              onChange={() => handleChange(task.id, !task.isDone)}
              className="rounded-full h-4 w-4 text-blue-600"
            />
          </div>
          <div className="ml-4">
            <p className="text-[14px] font-light text-white">{task.title}</p>
            <p className="text-[12px] text-red-500">{task.deadline}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
