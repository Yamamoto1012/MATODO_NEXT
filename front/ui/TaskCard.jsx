import React from "react";

export default function TaskCard({ task, onCheckboxChange, onCardClick }) {
  
  // 期限が今日または過去の日付かどうかを判断する
  const isDeadlinePast = () => {
    const today = new Date();
    today.setHours(0,0,0,0); // 今日の日付を0時0分0秒0ミリ秒に設定
    const deadline = new Date(task.deadline);
    deadline.setHours(0,0,0,0); // 期限の日付を0時0分0秒0ミリ秒に設定

    return deadline <= today; // 期限が今日または過去の場合はtrueを返す
  }
  
  return (
    <div
      className="bg-[#2B2D42] rounded-3xl shadow-md p-2 mx-2 flex items-center transform transition-transform duration-150 ease-in-out hover:scale-105"
      onClick={() => onCardClick(task)}
    >
      <div className="flex items-center h-4 w-4 ml-2 rounded-full border-none">
        <input
          type="checkbox"
          checked={task.isDone}
          onChange={(e) => onCheckboxChange(e, task.id, !task.isDone)}
          className="rounded-full h-4 w-4 text-blue-600"
          onClick={(e) => e.stopPropagation()} // 伝播を止める
        />
      </div>
      <div className="ml-4">
        <p className="text-[14px] font-light text-white">{task.title}</p>
        <p className={`text-[12px] ${isDeadlinePast() ? 'text-red-500' : 'text-blue-500'}`}>{task.deadline}</p>
      </div>
    </div>
  );
}
