"use client";
import React, { useState } from "react";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../app/firebase";

export default function AddTask() {
  const [text, setText] = useState("");

  //締切を入力した当日にする
  const deadline = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    const formattedMonth = month < 10 ? "0" + month : month;
    const formattedDate = date < 10 ? "0" + date : date;

    return `${year}-${formattedMonth}-${formattedDate}`;
  };

  const description = null;
  const importance = null;
  const isDone = false;
  const urgency = null;

  const changeText = (e) => {
    setText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13 && !e.isComposing) {
      const currentUser = auth.currentUser;
      const newTask = {
        userId: currentUser.uid,
        title: text,
        description: description,
        importance: importance,
        isDone: isDone,
        urgency: urgency,
        deadline: deadline(),
      };
      setDoc(doc(db, "tasks", text), newTask);
      setText("");
    } else if (e.key === "Escape") {
      setText("");
    }

    if (e.keyCode === 13 && e.isComposing) {
      e.preventDefault();
    } else if (e.keyCode === 13 && !e.isComposing) {
      const currentUser = auth.currentUser;
      const newTask = {
        userId: currentUser.uid,
        title: text,
        description: description,
        importance: importance,
        isDone: isDone,
        urgency: urgency,
        deadline: deadline(),
      };
      setDoc(doc(db, "tasks", text), newTask);
      setText("");
    }
  };

  return (
    <div className="bg-[#222831] w-[450px] md:w-[600px] lg:w-[800px] h-14 md:h-[60px] rounded-full outline outline-white outline-1 ">
      <div className="flex flex-row items-center text-[#00ADB5] ">
        <div className="flex my-[17px] ml-3">
          <div className="w-[25px] h-[25px]">
            <CreateOutlinedIcon />
          </div>
          <input
            type="text"
            placeholder="タスクを入力"
            value={text}
            onChange={changeText}
            onKeyDown={handleKeyDown}
            className="w-full max-w-xs md:max-w-md lg:max-w-lg bg-[#222831] h-auto outline-none placeholder-[#00ADB5] text-base ml-2"
          />
        </div>
      </div>
    </div>
  );
}
