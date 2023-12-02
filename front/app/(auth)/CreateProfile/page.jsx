"use client";
import { useState } from "react";
import { auth, db, storage } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

export default function Page() {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [icon, setIcon] = useState(null);
  const router = useRouter();

  const handleIconChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setIcon(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      console.log("ユーザーがログインしていません");
      return;
    }
    const userId = auth.currentUser.uid;
    let iconUrl = "";

    if (icon) {
      const iconRef = ref(storage, `icons/${userId}/${icon.name}`);
      await uploadBytes(iconRef, icon);
      iconUrl = await getDownloadURL(iconRef);
    }

    const userRef = doc(db, "users", userId);

    try {
      await setDoc(userRef, {
        name: name,
        position: position,
        iconUrl: iconUrl,
      });
      console.log("プロフィールが作成されました");
      router.push("/");
    } catch (error) {
      console.error("エラーが発生しました", error);
    }
  };

  // コンポーネントのレンダリング部分
  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md max-w-2xl w-full mx-4"
      >
        <div className="mb-6">
          <div className="flex items-center h-4 w-full">
            <p
              className="text-gray-700 text-sm font-medium mb-2"
              htmlFor="email"
            >
              ユーザー名
            </p>
            <p className="text-red-500 text-[12px] mb-2">(必須)</p>
          </div>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="dmn大郎"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-6">
          <div className="flex items-center h-4 w-full">
            <p className="text-black text-sm font-medium mb-2" htmlFor="email">
              役職
            </p>
            <p className="text-red-500 text-[12px] mb-2">(必須)</p>
          </div>
          <input
            id="position"
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="役職"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-transform duration-150 ease-in-out transform hover:scale-105"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="icon"
            className="block text-sm font-medium text-gray-700"
          >
            アイコン (任意)
          </label>
          <div className="mt-1 flex items-center">
            <span className="rounded-md border border-gray-300 shadow-sm bg-white py-2 px-3 text-sm leading-4 text-gray-700">
              {icon ? icon.name : "アイコンを選択"}
            </span>
            <button
              type="button"
              className="ml-3 bg-[#00ADB5] text-white font-bold py-2 px-4 rounded-xl"
              onClick={() => document.getElementById("icon").click()}
            >
              アップロード
            </button>
            <input
              id="icon"
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              className="hidden"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#00ADB5] text-white font-bold py-2 px-4 rounded-xl transition-transform duration-150 ease-in-out transform hover:scale-105"
        >
          アカウント作成
        </button>
      </form>
    </div>
  );
}
