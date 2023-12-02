import React from "react";
import Days from "./Days";
import ProfileCard from "./ProfileCard";
import TaskList from "./TaskList";
import CompletedTaskButton from "./CompletedTaskButton";

function Menu() {
  return (
    <div className="p-6">
      <div className="w-60 bg-[#393E4F] rounded-2xl shadow-2xl h-[95vh] flex flex-col">
        <div className="w-full h-48 flex items-center justify-center">
          <Days />
        </div>

        <div className="w-full flex-grow overflow-auto ">
          <TaskList />
        </div>
        <div className="w-auto h-auto">
          <CompletedTaskButton />
        </div>
        <div className="w-full p-4">
          <ProfileCard />
        </div>
      </div>
    </div>
  );
}

export default Menu;
