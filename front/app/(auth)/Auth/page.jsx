"use client";
import React from "react";
import Link from "next/link";
import { GoogleLogin } from "./Auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const handleCreate = () => {
    router.push("/AccountCreating");
  };

  const handleLogin = () => {
    router.push("/Login");
  };
  return (
    <div className="bg-[#393E4F] h-screen w-screen flex justify-center items-center">
      <div className="bg-white rounded-lg px-12 py-16 w-[500px] h-[462px] shadow-lg flex flex-col items-center space-y-6">
        <h1 className="text-[54px] font-bold text-gray-800">Eisenhower</h1>

        <button
          className="text-white bg-[#00ADB5] hover:bg-blue-700 font-bold py-3 px-4 rounded w-full transition-transform duration-150 ease-in-out transform hover:scale-105 shadow-xl"
          onClick={handleCreate}
        >
          アカウントを作成
        </button>

        <button
          className="text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 font-bold py-3 px-4 rounded w-full transition-transform duration-150 ease-in-out transform hover:scale-105 shadow-xl"
          onClick={handleLogin}
        >
          ログイン
        </button>

        <div className="flex items-center flex-col space-y-2">
          <GoogleLogin />
        </div>
      </div>
      <Link href="https://ja.wikipedia.org/wiki/%E3%83%89%E3%83%AF%E3%82%A4%E3%83%88%E3%83%BBD%E3%83%BB%E3%82%A2%E3%82%A4%E3%82%BC%E3%83%B3%E3%83%8F%E3%83%AF%E3%83%BC">
        <Image
          src="/Hower.jpeg"
          width={325}
          height={325}
          alt="Google"
          className="transition-transform duration-700 ease-in-out transform hover:scale-125 hover:rotate-720 shadow-xl img-hover rounded-2xl"
        />
      </Link>
    </div>
  );
}
