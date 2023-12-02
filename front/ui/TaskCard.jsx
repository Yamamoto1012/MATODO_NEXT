// TaskCard.js
import React from "react";
import { useDraggable } from "@dnd-kit/core";

export default function TaskCard({ task, onCheckboxChange, onCardClick }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
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
        <p className="text-[12px] text-red-500">{task.deadline}</p>
      </div>
    </div>
  );
}
