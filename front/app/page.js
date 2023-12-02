"use client";

import AddTask from "../ui/AddTask";
import SideBar from "../ui/SideBar";
import MatrixArea from "../ui/MatrixArea";

export default function Home() {
  return (
    <div className="bg-[#393E4F] h-[100vh] w-screen flex">
      <SideBar />
      <div className="relative shadow-lg h-[100vh] w-[70vw] md:w-[85vw] flex flex-col items-center bg-[#222831]">
        <MatrixArea />
        <div className="absolute bottom-12 w-full items-center justify-center flex">
          <AddTask />
        </div>
      </div>
    </div>
  );
}
