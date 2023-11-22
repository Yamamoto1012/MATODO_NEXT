"use client";
import { useState } from "react";
import { auth, db, storage } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CreateProfile() {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [icon, setIcon] = useState(null);

  const handleIconChange = (e) => {
    if (e.target.files.length > 0) {
      //アイコン画像のファイルを取得
      const file = e.target.files[0];
      setIcon(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      console.log("ユーザーがログインしていません");
    }
    const userId = auth.currentUser.uid;
    let iconUrl = "";

    if (icon) {
      //　画像をFirebase Storageにアップロード
      const iconRef = ref(storage, `icons/${userId}/${icon.name}`);
      await uploadBytes(iconRef, icon);
      iconUrl = await getDownloadURL(iconRef);
    }

    const userRef = doc(db, "users", userId);

    try {
      //FireStoreにユーザー情報を保存
      await setDoc(userRef, {
        name: name,
        positsion: position,
        iconUrl: iconUrl,
      });

      console.log("プロフィールが作成されました");
    } catch (error) {
      console.error("エラーが発生しました", error);
    }
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="コンスタンチノープル"
          className="block w-full p-2 my-2 border border-[#00ADB5] rounded-md shadow-sm"
        />
        <input
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="学生"
          className="block w-full p-2 my-2 border border-[#00ADB5] rounded-md shadow-sm "
        />
        {/* アイコン画像を追加 */}
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleIconChange} 
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:border-0 file:rounded-md file:text-sm  file:font-semibold
            file:bg-[#393E46] file:text-[#00ADB5]
            hover:file:bg-[#00ADB5] hover:file:text-white "
        />
        <button 
          type="submit"
          className="mt-4 w-full bg-[#393E46] hover:bg-[#00ADB5] text-[#00ADB5] hover:text-white py-2 px-4 rounded-md shadow-sm font-semibold"
        >
          アカウント作成
        </button>
      </form>
    </div>
  );
}
