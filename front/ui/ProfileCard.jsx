"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { auth, db } from "../app/firebase"; // 適切なパスに修正してください
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function ProfileCard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // ログインしているユーザーが存在する場合
        const fetchUser = async () => {
          const userRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            setUser(docSnap.data());
          } else {
            console.log("ユーザーデータが見つかりません");
          }
        };

        fetchUser();
      } else {
        console.log("ログインユーザーが存在しません");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-[#2B2D42] p-1 rounded-2xl shadow-2xl transform transition-transform duration-300 ease-in-out hover:scale-105">
      {user && (
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Link href="/Profile">
                <Image
                  src={user.iconUrl || "/default-icon.svg"}
                  width={45}
                  height={45}
                  className="rounded-full"
                  alt="User Icon"
                />
            </Link>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-base text-white font-semibold">
              {user.name}
            </span>
            <span className="text-sm text-gray-300">
              {user.position}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}