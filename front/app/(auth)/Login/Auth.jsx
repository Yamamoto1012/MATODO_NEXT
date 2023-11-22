"use client";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

//登録
export function Register () {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  //　登録ボタンを押した時の処理
  const handlerRegister = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // サインイン
      const user = userCredential.user;
    })
    .catch((error) => {
      setError(error.message);
    })
    console.log(email, password)
  }
  
    return (
      <>
        <form onSubmit={handlerRegister}>
          <input 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="example@example.com"
            />
          <input 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="text"
            placeholder="12345678"
            />
          <button type="submit">登録</button>
        </form>
        {error && <p>{error}</p>}
      </>
    )
}

//既存のユーザーでログイン
export function Login () {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const hanldeLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      alert("ログインしました")
    })
    .catch((error) => {
      setError(error.message);
    })
  }

  return (
    <>
      <form onSubmit={hanldeLogin}>
        <input 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          placeholder="example@example.com"
          />
        <input 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="text"
          placeholder="12345678"
          />
        <button type="submit">ログイン</button>
      </form>
      {error && <p>{error}</p>}
    </>
  )
}

//ログアウト
export function Logout () {
  const handleLogout = () => {
    auth.signOut()
    .then(() => {
      alert("ログアウトしました")
    })
    .catch((error) => {
      console.log(error.message)
    })
  }
  return (
    <>
      <button onClick={handleLogout}>ログアウト</button>
    </>
  )
}