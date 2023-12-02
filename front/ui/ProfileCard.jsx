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
    <div className=" w-full h-14 flex items-center space-x-2 border bg-[#222831] p-1 rounded-lg shadow-lg transform transition-transform duration-150 ease-in-out hover:scale-125">
      {user && (
        <>
          <div className="shrink-0 h-14 items-center justify-center flex">
            <Link href="/Profile">
              <Image
                src={user.iconUrl || "./default-icon.svg"}
                width={45}
                height={45}
                className="w-11 h-11 rounded-full border-2 border-[#BDAE93] transform transition-transform duration-150 ease-in-out hover:scale-125"
                alt="User Icon"
              />
            </Link>
          </div>
          <div className="h-15 w-full flex flex-col">
            <div className="text-[#EEEEEE] text-base font-normal">
              {user.name}
            </div>
            <div className="text-[#78858F] text-sm">{user.position}</div>
          </div>
        </>
      )}
    </div>
  );
}
