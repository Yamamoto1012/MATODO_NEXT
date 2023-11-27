"use client";
import React, { useState } from "react";
import EditIcon from '@mui/icons-material/Edit';

export default function AddTask() {
    // useStateを使って入力値を状態として持つ
    const [text, setText] = useState("");

    // tasksのdatabaseに必要な要素
    const urgency = null;
    const importance = null;
    const isDone= false;
    const favorite = false;

    // テキストフィールドの値の変更を反映させる
    const changeText = (e) => {
        setText(e.target.value);
    };

    // keyeventの処理
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            // Enterが押されたら、入力値をFirestoreに保存
            const taskRef = db.collection("tasks").doc(currentUser.uid);
            try {
                taskRef.set({
                    userId: currentUser.uid,
                    title: text,
                    urgency: urgency,
                    importance: importance,
                    isDone: isDone,
                    favorite: favorite,
                });
            } catch (error) {
                console.log(error);
                alert("データの保存に失敗しました。もう一度入力してください");
            }
            setText("");
        } else if (e.key === "Escape") {
            // Escが押されたら、入力値をクリア
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
