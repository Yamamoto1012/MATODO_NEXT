"use client";
import Image from "next/image";
import { auth } from "../../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

//Googleアカウントでログイン
export function GoogleLogin() {
  const provider = new GoogleAuthProvider();
  const handleGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  };
  return (
    <div>
      <button onClick={handleGoogle} className="focus:outline-none">
        <div className="flex flex-col justify-center items-center space-y-2 transition-transform duration-150 ease-in-out transform hover:scale-105">
          <div>googleアカウントでログイン</div>
          <Image src="/google.svg" width={50} height={50} alt="Google" />
        </div>
      </button>
    </div>
  );
}

//ログアウト
export function Logout() {
  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        alert("ログアウトしました");
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
  return (
    <>
      <button onClick={handleLogout}>ログアウト</button>
    </>
  );
}
