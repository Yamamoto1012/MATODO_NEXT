"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, doc, getDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfilePage() {
  //userテーブルからcurrentUserの情報を取得
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // ログインユーザーがいる場合、Firestoreからデータを取得
        const userRef = doc(db, "users", currentUser.uid);
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data());
            console.log("ユーザーデータを取得しました");
          } else {
            console.log("ユーザーデータが見つかりません");
          }
        });
      } else {
        // ユーザーがログアウトしている場合
        setUser(null);
      }
    });
    // コンポーネントのアンマウント時にリスナーを解除
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <>
      <h1>プロフィール</h1>
      <div>
        <p>名前</p>
        {/* currentUserのnameを表示 */}
        <p>{user ? user.name : "読み込み中..."}</p>
        <button onClick={handleSignOut}>ログアウト</button>
      </div>
    </>
  );
}
