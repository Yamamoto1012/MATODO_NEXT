import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { auth, db } from "../app/firebase";
import { query, collection, onSnapshot, doc, updateDoc, deleteDoc, where, getDocs } from "firebase/firestore";
import DatePicker from "react-datepicker";
import TaskCard from "./TaskCard"; // TaskCardコンポーネントの実装は未定義
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import "react-datepicker/dist/react-datepicker.css";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const fetchTasks = async () => {
          const q = query(collection(db, "tasks"), where("userId", "==", user.uid), where("isDone", "==", false));
          const querySnapshot = await getDocs(q);
          const tasksArr = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTasks(tasksArr);
        };
        fetchTasks();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleTaskCardClick = (task) => {
    setSelectedTask(task);
    setSelectedDate(task.deadline ? new Date(task.deadline) : new Date());
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedTask(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (selectedTask) {
      const updates = {
        ...selectedTask,
        deadline: selectedDate.toISOString().split('T')[0],
      };
      const taskRef = doc(db, "tasks", selectedTask.id);
      try {
        await updateDoc(taskRef, updates);
        // 更新後のタスクリストをフェッチする必要がある場合は、ここでfetchTasks()を呼び出します。
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  return (
    <div>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onCardClick={() => handleTaskCardClick(task)}
          />
        ))}
      </div>
      {showSidebar && selectedTask && (
        <div className="fixed inset-y-0 right-0 w-80 bg-[#1F1F1F] p-8 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
          <button onClick={closeSidebar} className="text-white rounded-full p-2 hover:bg-[#333333] focus:outline-none absolute top-4 right-4">
            <CloseIcon fontSize="large" />
          </button>
          <div className="flex flex-col space-y-4">
            <input
              name="title"
              type="text"
              value={selectedTask.title || ''}
              onChange={handleInputChange}
              className="text-xl font-bold text-white bg-[#2A2A2A] rounded-lg p-4 outline-none border border-transparent focus:border-[#00ADB5]"
              placeholder="タイトル"
            />
            <textarea
              name="memo"
              value={selectedTask.memo || ''}
              onChange={handleInputChange}
              className="text-white bg-[#2A2A2A] rounded-lg p-4 outline-none border border-transparent focus:border-[#00ADB5]"
              placeholder="メモ"
            />
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy/MM/dd"
              className="text-center text-white bg-[#2A2A2A] rounded-lg p-4 outline-none border border-transparent focus:border-[#00ADB5]"
            />
            <button onClick={handleUpdate} className="bg-[#00ADB5] text-white rounded-lg p-2 hover:bg-[#008a9e]">
              更新
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
