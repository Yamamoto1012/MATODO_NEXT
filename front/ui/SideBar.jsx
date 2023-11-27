import React from 'react'
import Days from './Days'
import ProfileCard from './ProfileCard'

function SideBar() {
  return (
    <div className='p-4'>
        <div className='w-60 bg-white rounded-2xl shadow-md h-[95vh] flex flex-col'>
          <div className='w-full h-48 flex items-center justify-center'>
            <Days />
          </div>

          <div className='w-full flex-grow overflow-auto'>
            {/* セクション内容をここに追加 */}
            <div className='p-4'>
              {/* 各アイテムのサンプル */}
              <div className='flex items-center p-2 rounded-lg bg-[#2E333B] mb-2'>
                <span className='text-white'>アイテム 1</span>
              </div>
              {/* 繰り返すアイテム */}
            </div>
          </div>
          <div className='w-full p-4'>
            <ProfileCard />
          </div>
        </div>
    </div> 
  )
}

export default SideBar