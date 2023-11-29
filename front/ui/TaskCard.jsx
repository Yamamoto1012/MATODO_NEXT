"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../app/firebase";
import { query, collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

export default function TaskCard() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "tasks"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let tasksArr = [];
      querySnapshot.forEach((doc) => {
        tasksArr.push({ ...doc.data(), id: doc.id });
      });
      //isDoneを表示しない様にする
      tasksArr = tasksArr.filter((task) => task.isDone === false);
      setTasks(tasksArr);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = async (taskId, isDone) => {
    // FirebaseのtasksテーブルのtaskのisDoneを更新する
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      isDone: isDone
    });
  };

  const handleTaskCardClick = (task) => {
    setSelectedTask(task);
    setShowSidebar(true); // サイドバーを表示
  };

  // サイドバーを閉じる関数
  const closeSidebar = () => {
    setShowSidebar(false);
  }

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-[#2B2D42] rounded-[15px] shadow-md p-2 mx-1 flex items-center transition duration-500 ease-in-out cursor-pointer`}
            onClick={() => handleTaskCardClick(task)}
          >
            <div className="flex items-center h-4 w-4 ml-2 rounded-full border-none">
              <input
                type="checkbox"
                checked={task.isDone}
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

     {/* タスク詳細を表示するサイドバー */}
      {showSidebar && selectedTask && (
          <div
            className="fixed top-0 right-0 w-64 h-full bg-[#393E4F] shadow-lg p-4 z-50"
            style={{
              transform: showSidebar ? `translateX(full)` : `translateX(0)`,
              transition: "transform 3s ease-in-out",
            }}
          >
            <button onClick={closeSidebar}>Close</button>
            <h3 className="text-xl font-bold mb-2 text-white">{selectedTask.title}</h3>
            {/* 締切とアイコンを横並びに */}
            <div className="flex items-center h-9 w-full p-2  rounded-3xl bg-[#222831]">
              <CalendarMonthOutlinedIcon className="text-[#FF6B6B] mr-2"/>
              <p className="text-[#FF6B6B]">締切: {selectedTask.deadline}</p>
            </div>
            {selectedTask.isDone === false && (
              <p className="text-[#FF6B6B]">未完了</p>
            )}
          </div>
        )}
    </>
  );
}
