"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  //userテーブルからcurrentUserの情報を取得
  const [user, setUser] = useState(null);
  const router = useRouter();

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
    router.push("/Auth")
  };

  const handleLogin = () => {
    router.push("/Login")
  }

  const handleHome = () => {
    router.push("/")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
      <h1 className="text-4xl font-medium text-white mb-8">プロフィール</h1>
      <div className="bg-gray-900 p-32 rounded-lg shadow-lg text-white">
        <div className="flex flex-col items-center">
          <div className=" w-96 h-80 mb-3 items-center flex justify-center">
            <Image src={user && user.iconUrl ? user.iconUrl : "/default-icon.svg"} width={250} height={250} className="rounded-full transform transition-transform duration-150 ease-in-out hover:scale-125" />
          </div>
          <p className="text-lg font-semibold">{user ? user.name : "読み込み中..."}</p>
          <p className="text-sm">{user ? user.position : "役職"}</p>
          <button
            onClick={handleHome}
            className="mt-4 w-full bg-[#BDAE93] text-white font-bold py-2 px-4 rounded-lg space-y-1 transition-transform duration-150 ease-in-out transform hover:scale-105 shadow-xl"
          >
            マトリックスに戻る
          </button>
          <button
            onClick={handleLogin}
            className="mt-4 w-full bg-[#00ADB5] text-white font-bold py-2 px-4 rounded-lg space-y-1 transition-transform duration-150 ease-in-out transform hover:scale-105 shadow-xl"
          >
            アカウントを変更
          </button>
          <button
            onClick={handleSignOut}
            className="mt-4 w-full bg-[#FF6B6B] text-white font-bold py-2 px-4 rounded-lg transition-transform duration-150 ease-in-out transform hover:scale-105 shadow-xl"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}