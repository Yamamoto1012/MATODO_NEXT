"use client";
import React, { useState } from "react";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../app/firebase";

export default function AddTask() {
  const [text, setText] = useState("");

  // 日付をYYYY-MM-DD形式でフォーマット
  const formatTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    return `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
  };

  const createNewTask = () => {
    if (text.trim() === "") return; // 空のタスクを防ぐ

    const newTask = {
      userId: auth.currentUser.uid,
      title: text,
      description: null, // 説明は常にnull
      importance: "high",
      isDone: false,
      urgency: "high",
      deadline: formatTodayDate(),
    };
    return newTask;
  };

  const changeText = (e) => setText(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.isComposing) {
      const newTask = createNewTask();
      if (newTask) {
        setDoc(doc(db, "tasks", newTask.title), newTask);
        setText("");
      }
    } else if (e.key === "Escape") {
      setText("");
    }
  };

  return (
    <div className="bg-[#222831] w-[450px] md:w-[600px] lg:w-[800px] h-14 md:h-[60px] rounded-full outline outline-white outline-1 transition-transform duration-150 ease-in-out transform hover:scale-105">
      <div className="flex flex-row items-center text-[#00ADB5]">
        <div className="flex my-[17px] ml-3 shadow-xl">
          <div className="w-[25px] h-[25px]">
            <CreateOutlinedIcon />
          </div>
          <input
            type="text"
            placeholder="タスクを入力"
            value={text}
            onChange={changeText}
            onKeyDown={handleKeyDown}
            className="w-screen md:max-w-md lg:max-w-[750px] bg-[#222831] h-auto outline-none placeholder-[#00ADB5] text-base ml-2"
          />
        </div>
      </div>
    </div>
  );
}
