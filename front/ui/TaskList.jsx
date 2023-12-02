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
  deleteDoc,
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

  const handleMemoChange = async (e) => {
    e.preventDefault();
    const memo = e.target.memo.value; // フォームからメモを取得
    if (selectedTask) {
      const taskRef = doc(db, "tasks", selectedTask.id);
      updateDoc(taskRef, {
        memo: memo,
      });
      setSelectedTask({ ...selectedTask, memo: memo });
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
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

  const handleTitleChange = async(e) => {
    e.preventDefault();
    const title = e.target.title.value;
    if (selectedTask) {
      const taskRef = doc(db, "tasks", selectedTask.id);
      updateDoc(taskRef, {
        title: title,
      });
      setSelectedTask({ ...selectedTask, title: title });
    }
  }

  const handleTaskCardClick = (task) => {
    setSelectedTask(task);
    setSelectedDate(new Date(task.deadline));
    setShowSidebar(true); // サイドバーを表示
  };

  // サイドバーを閉じる関数
  const closeSidebar = () => {
    setShowSidebar(false);
  };

  //タスクをtasksテーブルから削除する
  const handleDelete = async () => {
    const taskRef = doc(db, "tasks", selectedTask.id);
    await deleteDoc(taskRef);
    setShowSidebar(false);
    setSelectedTask(null); 
  }

  return (
    <>
      <div className="space-y-3">
        {/* Task cards map */}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onCheckboxChange={handleChange}
            onCardClick={handleTaskCardClick}
          />
        ))}
      </div>

      {/* Sidebar */}
      {showSidebar && selectedTask && (
        <div
          className={`fixed inset-y-0 right-0 w-80 bg-[#1F1F1F] shadow-2xl p-8 z-50 transform transition-transform duration-300 ease-in-out ${
            showSidebar ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ boxShadow: '4px 0 15px rgba(0, 0, 0, .5)' }}
        >
          <button
            onClick={closeSidebar}
            className="text-white rounded-full p-2 hover:bg-[#333333] focus:outline-none absolute top-4 right-4"
          >
            <CloseIcon fontSize="large" />
          </button>

          <div className="flex flex-col items-start justify-between h-full">
            <div className="w-full">
              {/* Task title */}
              <form onSubmit={handleTitleChange} className="space-y-4">
                <h3 className="text-lg font-semibold text-[#00ADB5]">タスク名</h3>
                <input
                  name="title"
                  type="text"
                  className="w-full bg-[#2A2A2A] text-xl font-bold text-white rounded-lg p-4 outline-none border border-transparent focus:border-[#00ADB5]"
                  defaultValue={selectedTask.title}
                />
                <button
                  type="submit"
                  className="w-full bg-[#00ADB5] text-white rounded-lg p-2 hover:bg-[#008a9e] transform transition-transform duration-150 ease-in-out hover:scale-105"
                >
                  更新
                </button>
              </form>
            </div>

            {/* Task date */}
            <div className="w-full mt-6">
              <CalendarMonthOutlinedIcon className="text-[#00ADB5]" />
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="yyyy/MM/dd"
                wrapperClassName="date-picker"
                className="w-full bg-[#2A2A2A] text-center text-white rounded-lg p-4 outline-none border border-transparent focus:border-[#00ADB5]"
                popperClassName="react-datepicker-right"
              />
            </div>

            {/* Task memo */}
            <div className="w-full mt-6">
              <p className="text-lg font-semibold text-white">メモ</p>
              <form onSubmit={handleMemoChange}>
                <textarea
                  name="memo"
                  className="w-full bg-[#2A2A2A] text-white rounded-lg p-4 h-40 outline-none border border-transparent focus:border-[#00ADB5]"
                  defaultValue={selectedTask.memo || ""}
                />
                <button
                  type="submit"
                  className="w-full bg-[#00ADB5] text-white rounded-lg p-2 mt-4 hover:bg-[#008a9e] transform transition-transform duration-150 ease-in-out hover:scale-105"
                >
                  保存
                </button>
              </form>
            </div>

            {/* Delete task */}
            <div className="w-full mt-6">
              <button
                onClick={handleDelete}
                className="w-full bg-[#FF6B6B] text-white rounded-lg p-2 hover:bg-[#e63946] transform transition-transform duration-150 ease-in-out hover:scale-105"
              >
                タスク削除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
