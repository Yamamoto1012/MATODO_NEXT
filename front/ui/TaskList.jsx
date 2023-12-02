// 親コンポーネント
import React, { useEffect, useState } from "react";
import { db } from "../app/firebase";
import { query, collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import TaskCard from './TaskCard';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

export default function TaskList() {
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

  const handleChange = async (e, taskId, isDone) => {
    e.stopPropagation(); // 親要素に伝達しない様にする。
    // FirebaseのtasksテーブルのtaskのisDoneを更新する
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      isDone: isDone,
    });
  };

  const handleTaskCardClick = (task) => {
    setSelectedTask(task);
    setShowSidebar(true); // サイドバーを表示
  };

  // サイドバーを閉じる関数
  const closeSidebar = () => {
    setShowSidebar(false);
  };

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onCheckboxChange={handleChange}
            onCardClick={handleTaskCardClick}
          />
        ))}
      </div>
      {/* サイドバー関連のコード... */}
      {showSidebar && selectedTask && (
        <div
          className="fixed top-0 right-0 w-64 h-full bg-[#393E4F] shadow-lg p-4 z-50"
          style={{
            transform: showSidebar ? `translateX(full)` : `translateX(0)`,
            transition: "transform 3s ease-in-out",
          }}
        >
          <button onClick={closeSidebar}>Close</button>
          <h3 className="text-xl font-bold mb-2 text-white">
            {selectedTask.title}
          </h3>
          {/* 締切とアイコンを横並びに */}
          <div className="flex items-center h-9 w-full p-2  rounded-3xl bg-[#222831]">
            <CalendarMonthOutlinedIcon className="text-[#FF6B6B] mr-2" />
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
