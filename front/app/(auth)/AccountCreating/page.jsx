"use client";

import { useState } from "react";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

//登録
export default function page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  //　登録ボタンを押した時の処理
  const handlerRegister = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // サインイン
        const user = userCredential.user;
        router.push("/CreateProfile");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handlerRegister}
        className="bg-white h-auto p-16 rounded-lg shadow-md max-w-4xl mx-auto my-10"
      >
        <div className="mb-4">
          <div className="flex items-center h-4 w-full">
            <p className="text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              メールアドレス
            </p>
            <p className="text-red-500 text-[12px] mb-2">(必須)</p>
          </div>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="example@example.com"
          />
        </div>

        <div className="mb-4 pt-4">
          <div className="flex items-center h-4 w-full">
            <p className="text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              パスワード
            </p>
            <p className="text-red-500 text-[12px] mb-2">(必須)</p>
          </div>

          <p className="text-[12px] text-red-500">
            パスワードは半角英数16文字以上で入力してください
          </p>

          <input
            className="w-full p-2 mb-6 border rounded focus:outline-none focus:shadow-outline"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="12345678"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#00ADB5] text-white font-bold py-2 px-4 rounded-xl transition-transform duration-150 ease-in-out transform hover:scale-105"
        >
          次へ
        </button>
      </form>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
}
