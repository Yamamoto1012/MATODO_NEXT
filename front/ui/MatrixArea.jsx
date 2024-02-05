import { useEffect, useState } from "react";
import { auth, db } from "../app/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Cached } from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"; // 追加
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"; // 追加

function TaskCategory({ title, tasks, bgColorFrom, bgColorTo }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div
      className={`bg-gradient-to-tr from-${bgColorFrom} to-${bgColorTo} flex flex-col justify-center items-center rounded-lg shadow-md overflow-hidden p-2 transform transition-transform duration-300 ease-in-out hover:scale-105`}
    >
      <p className="text-white text-2xl font-semibold mb-2">{title}</p>
      {tasks.slice(0, showAll ? tasks.length : 4).map((task) => (
        <div
          key={task.id}
          className="bg-[#2B2D42] text-white text-base px-3 py-2 rounded-lg shadow m-1"
        >
          {task.title}
        </div>
      ))}
      {tasks.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-white mt-2 hover:underline"
        >
          {showAll ? (
            <>
              <ArrowDropUpIcon /> 折りたたむ
            </>
          ) : (
            <>
              <ArrowDropDownIcon /> もっと見る
            </>
          )}
        </button>
      )}
    </div>
  );
}

export function MatrixArea() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const fetchTasks = async () => {
          const tasksCollectionRef = collection(db, "tasks");
          const q = query(
            tasksCollectionRef,
            where("userId", "==", user.uid),
            where("isDone", "==", false)
          );
          const querySnapshot = await getDocs(q);
          const tasksData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTasks(tasksData);
        };

        fetchTasks();
      }
    });
    return () => unsubscribe();
  }, []);

  const categories = [
    {
      title: "緊急ではないが重要",
      filter: (task) => task.urgency === "low" && task.importance === "high",
      bgColorFrom: "green-500",
      bgColorTo: "green-300",
    },
    {
      title: "緊急で重要",
      filter: (task) => task.urgency === "high" && task.importance === "high",
      bgColorFrom: "red-500",
      bgColorTo: "pink-400",
    },
    {
      title: "緊急でも重要でもない",
      filter: (task) => task.urgency === "low" && task.importance === "low",
      bgColorFrom: "gray-500",
      bgColorTo: "gray-300",
    },
    {
      title: "緊急だが重要ではない",
      filter: (task) => task.urgency === "high" && task.importance === "low",
      bgColorFrom: "blue-500",
      bgColorTo: "blue-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4 p-6 mx-auto mt-12 rounded-xl shadow-xl w-[600px] h-auto md:w-[725px] lg:w-[800px]">
      <button
        onClick={() => window.location.reload()}
        className="absolute top-5 left-5 bg-gray-200 p-2 rounded-full shadow hover:bg-gray-300"
      >
        <Cached />
      </button>
      {categories.map((category) => (
        <TaskCategory
          key={category.title}
          title={category.title}
          tasks={tasks.filter(category.filter)}
          bgColorFrom={category.bgColorFrom}
          bgColorTo={category.bgColorTo}
        />
      ))}
    </div>
  );
}

export default MatrixArea;
