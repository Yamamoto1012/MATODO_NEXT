"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { auth, db } from "../app/firebase"; // 適切なパスに修正してください
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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
    <div className="w-[241px] h-[60px] justify-start items-center inline-flex bg-[#393E46]">
      {user && (
        <>
          <div className="justify-start h-[60px] items-center flex gap-2.5">
            <div className=" justify-start items-center flex">
              <Image
                src={user.iconUrl || "./default-icon.svg"}
                width={60}
                height={60}
                className="w-[60px] h-[60px] rounded-[50px]"
                alt="User Icon"
              />
            </div>
          </div>
          <div className="grow shrink basis-0 flex-col justify-center items-start gap-[3px] inline-flex">
            <div className="text-zinc-100 text-lg font-medium">{user.name}</div>
            <div className="self-stretch text-slate-500 text-[15px] font-normal leading-relaxed tracking-wide">
              {user.positsion}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
