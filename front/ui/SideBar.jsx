import React from 'react'
import Days from './Days'
import ProfileCard from './ProfileCard'
import SortableTaskList from './SortableTaskList'

function SideBar({
  id,
  tasks,
  label,
}) {
  return (
    <div className='p-4'>
        <div className='w-60 bg-[#393E4F] rounded-2xl shadow-xl h-[95vh] flex flex-col'>
          <div className='w-full h-48 flex items-center justify-center'>
            <Days />
          </div>

          <div className='w-full flex-grow overflow-auto'>
            <SortableTaskList 
              id={id}
              items={tasks}
              label={label}
            />
          </div>
          <div className='w-full p-4'>
            <ProfileCard />
          </div>
        </div>
    </div> 
  )
}

export default SideBar