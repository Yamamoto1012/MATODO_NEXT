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
    <div className="flex">
      {user && (
        <>
          <div className="">
            <div className="">
              <Link href="/Profile">
                <Image
                  src={user.iconUrl || "./default-icon.svg"}
                  width={45}
                  height={45}
                  className="w-[45px] h-[45px] rounded-[50px]"
                  alt="User Icon"
                />
              </Link>
            </div>
          </div>
          <div className="">
            <div className="">{user.name}</div>
            <div className="">
              {user.positsion}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
