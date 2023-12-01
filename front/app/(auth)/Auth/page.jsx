import React from 'react'
import Link from 'next/link'
import { GoogleLogin } from './Auth'
import Image from 'next/image'

export default function AuthPage() {
  return (
    <div className='bg-[#393E4F] h-screen w-screen flex justify-center items-center'>
      <div className='bg-white rounded-lg px-12 py-16 w-[500px] h-[462px] shadow-lg flex flex-col items-center space-y-6'>
        <h1 className='text-[54px] font-bold text-gray-800'>Eisenhower</h1>
  
        <button className='text-white bg-[#00ADB5] hover:bg-blue-700 font-bold py-3 px-4 rounded w-full transition-transform duration-150 ease-in-out transform hover:scale-105 shadow-xl'>
          <Link href={'/AccountCreating'}>
            アカウントを作成
          </Link>
        </button>

        <button className='text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 font-bold py-3 px-4 rounded w-full transition-transform duration-150 ease-in-out transform hover:scale-105 shadow-xl'>
          <Link href={'/Login'}>
            ログイン
          </Link>
        </button>

        <div className='flex items-center flex-col space-y-2'>
          <GoogleLogin />
        </div>

      </div>

      <Image src="/syouzoukengire.jpeg" width={500} height={500} alt="Google" className='transition-transform duration-700 ease-in-out transform hover:scale-150 hover:rotate-720 shadow-xl img-hover' />
    </div>
  )
}