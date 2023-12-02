"use client";
import Image from "next/image";
import { auth, db } from "../../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";


//Googleアカウントでログイン
export function GoogleLogin() {
  const provider = new GoogleAuthProvider();
  const router = useRouter();
  const handleGoogle = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        // Firestoreでユーザープロフィールを確認
        const userProfileRef = doc(db, "users", user.uid);
        const userProfileSnap = await getDoc(userProfileRef);

        if (userProfileSnap.exists()) {
          // プロフィールが存在する場合、Homeにリダイレクト
          router.push("/Home");
        } else {
          // プロフィールが存在しない場合、プロフィール作成ページにリダイレクト
          router.push("/CreateProfile");
        }
      })
      .catch((error) => {
        console.error("ログインエラー", error);
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
