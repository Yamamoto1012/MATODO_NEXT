'use client'

import ProfileCard from '../ui/ProfileCard'
import AddTask from '../ui/AddTask'
import Days from '../ui/Days'
import TaskCard from '../ui/TaskCard'
import SideBar from '../ui/SideBar'

export default function Home() {
  return (
    <div className=' bg-slate-700 h-[100vh] w-screen flex'>
      <SideBar />
      <div className='shadow-lg h-[100vh] w-[82vw] flex flex-col items-center bg-[#222831]'>
        <div>
          <div>
            <AddTask />
          </div>
        </div> 
      </div>
    </div>
  )
}
