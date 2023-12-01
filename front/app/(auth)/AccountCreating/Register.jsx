import { useState } from "react";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

//登録
export default function Register() {
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
      });
    console.log(email, password);
  };

  return (
    <>
      <form
        onSubmit={handlerRegister}
        className="bg-white p-8 rounded-lg shadow-md max-w-sm mx-auto"
      >
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
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          登録
        </button>
      </form>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </>
  );
}