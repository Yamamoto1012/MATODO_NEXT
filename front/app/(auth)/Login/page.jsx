"use client";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import Link from "next/link";

//既存のユーザーでログイン
export default function page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("ログインしているユーザー:", user);
      } else {
        console.log("ユーザーがログインしていません");
      }
    });

    // コンポーネントのアンマウント時にリスナーを解除
    return () => unsubscribe();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // ログイン成功時の処理
        alert("ログインしました");
      })
      .catch((error) => {
        // ログイン失敗時のエラー処理
        setError(error.message);
      });
  };

  return (
    <>
      <form
        onSubmit={handleLogin}
        className="bg-gray-100 h-auto p-16 rounded-lg shadow-md max-w-lg mx-auto my-10"
      >
        <div className="mb-4">
          <div className="flex items-center h-4 w-full">
            <p className="text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              メールアドレス
            </p>
            <p className="text-red-500 text-[12px] mb-2">(必須)</p>
          </div>

          <input
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sample@sample.com"
            required
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#00ADB5] text-white font-bold py-2 px-4 rounded-xl transition-transform duration-150 ease-in-out transform hover:scale-105"
        >
          <Link href={"/"}>ログイン</Link>
        </button>
      </form>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </>
  );
}
