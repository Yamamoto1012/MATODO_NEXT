"use client";
import React, { useState } from "react";
import EditIcon from '@mui/icons-material/Edit';
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../app/firebase";

export default function AddTask() {
    const [text, setText] = useState("");

    const description = null;
    const importance = null;
    const isDone = false;
    const urgency = null;
    const deadline = null;

    const changeText = (e) => {
        setText(e.target.value);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const currentUser = auth.currentUser;
            const newTask = {
                userId: currentUser.uid,
                title: text,
                description: description,
                importance: importance,
                isDone: isDone,
                urgency: urgency,
                deadline: deadline,
            }
            setDoc(doc(db, 'tasks', text), newTask)
            setText("");
        } else if (e.key === 'Escape') {
            setText("");
        }
    }

    return (
        <div className='bg-[#EEEEEE] w-[1035px] h-[72px] rounded-full'>
            <div className='flex flex-row ' style={{ color: '#00ADB5'}}>
                <p className='w-[40px] h-[40px] ml-[10px] my-5'>
                    <EditIcon/>
                </p>
                <input 
                    type='text'
                    placeholder='タスクを入力'
                    value={text}
                    onChange={changeText}
                    onKeyDown={handleKeyDown}
                    className="w-[950px] h-[72px] outline-none"
                    style={{ fontSize: '18px',fontFamily: 'Roboto',color: '#00ADB5', backgroundColor: '#EEEEEE'}}
                />
            </div>
        </div>
    )
}
