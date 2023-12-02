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
      router.push("/Home");
    } catch (error) {
      console.error("エラーが発生しました", error);
    }
  };

  // コンポーネントのレンダリング部分
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h2 className="text-4xl font-bold text-[#00ADB5] mb-6">プロフィール作成</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full mx-4"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="name">
            ユーザー名 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="工大太郎"
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="position">
            役職 <span className="text-red-500">*</span>
          </label>
          <input
            id="position"
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="役職"
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="icon">
            アイコン <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <span className="inline-block bg-gray-100 rounded-md py-2 px-3 text-sm text-gray-700 mr-3">
              {icon ? icon.name : "アイコンを選択"}
            </span>
            <button
              type="button"
              className="bg-[#00ADB5] text-white font-bold py-2 px-4 rounded-md transition-transform duration-150 ease-in-out transform hover:scale-105"
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
          className="w-full bg-[#00ADB5] text-white font-bold py-2 px-4 rounded-md transition-transform duration-150 ease-in-out transform hover:scale-105"
        >
          アカウント作成
        </button>
      </form>
    </div>
  );
}
