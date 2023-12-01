"use client";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../firebase";


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
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md max-w-sm mx-auto my-10">
        <input 
          className="w-full p-2 mb-3 border rounded focus:outline-none focus:shadow-outline"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email" 
          placeholder="example@example.com"
        />
        <input 
          className="w-full p-2 mb-6 border rounded focus:outline-none focus:shadow-outline"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="12345678"
        />
        <button type="submit" className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">ログイン</button>
      </form>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </>
  );
}