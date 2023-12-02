"use client";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";

import AddTask from "../../ui/AddTask";
import Menu from "../../ui/Menu";

export default function Page() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const tasksCollectionRef = collection(db, "tasks");
      const q = query(
        tasksCollectionRef,
        where("userId", "==", userId),
        where("isDone", "==", true)
      );
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(tasksData);
      });
  
      // コンポーネントのアンマウント時にリスナーを解除
      return () => unsubscribe();
    }
  }, [auth.currentUser]);
  
  const revertTask = async (taskId) => {
    const taskDocRef = doc(db, "tasks", taskId);
    await updateDoc(taskDocRef, {
      isDone: false,
    });
    // データの更新は onSnapshot によって自動的に処理されるので、fetchTasks を呼び出す必要はありません。
  };
  

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      <Menu />
      <div className="flex-1 flex flex-col items-center px-16 py-8">
        <div className="py-6 space-y-2 w-full max-w-full ">
          <h2 className="text-4xl font-semibold text-[#00ADB5]">
            完了済タスク
          </h2>
          <div className="w-full h-2.5 bg-[#00ADB5]"></div>
        </div>
        <div className="w-full max-w-full space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center rounded-2xl py-3 pl-4 bg-[#393E4F]"
            >
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-[#00ADB5] rounded border-gray-300"
                onChange={() => revertTask(task.id)}
                checked={false}
              />
              <div className="ml-4">
                <s className="text-lg">{task.title}</s>
                <p className="text-sm text-[#FF6B6B]">{task.deadline}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-12 w-full items-center justify-center flex">
          <AddTask />
        </div>
      </div>
    </div>
  );
}
