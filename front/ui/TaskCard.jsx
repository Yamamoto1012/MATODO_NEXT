// TaskCard.js
import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function TaskCard({ id, onCheckboxChange, onCardClick}) {
  return (
    <div
      className="bg-[#2B2D42] rounded-[15px] shadow-md p-2 mx-1 flex items-center transition duration-500 ease-in-out cursor-pointer"
    //   onClick={() => onCardClick(task)}
    >
      <div className="flex items-center h-4 w-4 ml-2 rounded-full border-none">
        <input
          type="checkbox"
        //   checked={task.isDone}
        //   onChange={(e) => onCheckboxChange(e, task.id, !task.isDone)}
          className="rounded-full h-4 w-4 text-blue-600"
          onClick={(e) => e.stopPropagation()} // 伝播を止める
        />
      </div>
      <div className="ml-4">
        <p className="text-[14px] font-light text-white">{id}</p>
        <p className="text-[12px] text-red-500">2022</p>
      </div>
    </div>
  );
}
