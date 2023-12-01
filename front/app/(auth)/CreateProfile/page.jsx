"use client";
import { useState } from "react";
import { auth, db, storage } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function page() {
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
      return;
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

    return (
      <>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="コンスタンチノープル"
          />
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="学生"
          />
          {/* アイコン画像を追加 */}
          <input type="file" accept="image/*" onChange={handleIconChange} />

          <button type="submit">アカウント作成</button>
        </form>
      </>
    );
  };
}
