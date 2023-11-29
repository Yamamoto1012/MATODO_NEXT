"use client"
import { useEffect, useState } from "react"
import { db } from "../app/firebase"
import { query, collection, onSnapshot } from "firebase/firestore";

export default function TaskCard() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'tasks'))
        const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
            let todosArr = []
            QuerySnapshot.forEach((doc) => {
                todosArr.push({...doc.data(), id: doc.id})
            });
            setTasks(todosArr)
        })
        return () => unsubscribe()
    }, []);

    return(
        <div>
            {tasks.map((task) => (
                <div key={task.id}>
                    <p>{task.isDone}</p>
                    <p>{task.title}</p>
                    <p>{task.date}</p>
                </div>
            ))}
        </div>
    )
}