// 親コンポーネント
import React, { memo, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { db } from "../app/firebase";
import {
  query,
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import DatePicker from "react-datepicker";
import TaskCard from "./TaskCard";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import "react-datepicker/dist/react-datepicker.css";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const handleMemoChange = async(e) => {
    e.preventDefault();
    const memo = e.target.memo.value; // フォームからメモを取得
    if (selectedTask) {
      const taskRef = doc(db, "tasks", selectedTask.id);
      updateDoc(taskRef, {
        memo: memo,
      });
      setSelectedTask({ ...selectedTask, memo: memo });
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date); // 選択された日付をローカルステートに設定
    if (selectedTask) {
      const taskRef = doc(db, "tasks", selectedTask.id);
      updateDoc(taskRef, {
        deadline: date.toISOString().split("T")[0],
      });
      setSelectedTask({
        ...selectedTask,
        deadline: date.toISOString().split("T")[0],
      });
    }
  };

  const handleTaskCardClick = (task) => {
    setSelectedTask(task);
    setSelectedDate(new Date(task.deadline));
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
          className={`fixed inset-y-0 right-0 w-72 bg-gradient-to-b from-[#393E4F] to-[#222831] shadow-xl p-6 z-50 transform transition-transform duration-500 ease-in-out ${
            showSidebar ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            onClick={closeSidebar}
            className="absolute top-6 right-6 text-white hover:text-[#00ADB5] focus:outline-none"
          >
            <CloseIcon fontSize="large" />
          </button>

          <div className="flex flex-col items-center pt-16 pb-4">
            <div className="bg-[#222831] p-4 w-full rounded-2xl shadow-lg mb-6">
              <h3 className="text-lg text-[#00ADB5]">タスク名</h3>
              <h3 className="text-2xl font-bold text-white">
                {selectedTask.title}
              </h3>
            </div>

            <div className="flex items-center w-full p-4 rounded-2xl bg-[#222831] shadow-inner transform transition-transform duration-150 ease-in-out hover:scale-105">
              <CalendarMonthOutlinedIcon className="text-[#00ADB5]" />
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="yyyy/MM/dd"
                className="text-center bg-transparent border-none text-white cursor-pointer outline-none"
              />
            </div>

            <div className="flex flex-col w-full p-4 mt-6 bg-[#222831] rounded-2xl">
              <p className="my-1">
                メモ
              </p>
              <div>
                <form onSubmit={handleMemoChange}>
                  <textarea name="memo" className="w-full p-2 h-44 rounded-2xl text-[#222831] transform transition-transform duration-150 ease-in-out hover:scale-105" defaultValue={selectedTask.memo || ""}/>
                  <button type="submit" className="mt-2 px-4 py-2 bg-[#00ADB5] rounded-2xl transform transition-transform duration-150 ease-in-out hover:scale-105">保存</button>
                </form>
              </div>
            </div>

            {/* タスク別のリストに追加 */}
          </div>
        </div>
      )}
    </>
  );
}
