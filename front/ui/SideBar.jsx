import React from 'react'
import Days from './Days'
import ProfileCard from './ProfileCard'
import TaskList from './TaskList'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

function SideBar()  {
  

  return (
    <div className='p-4'>
        <div className='w-60 bg-[#393E4F] rounded-2xl shadow-xl h-[95vh] flex flex-col'>
          <div className='w-full h-48 flex items-center justify-center'>
            <Days />
          </div>
          <SortableContext>
            <div className='w-full flex-grow overflow-auto'>
              <SortableItem>
                <TaskList/>
              </SortableItem>
            </div>
          </SortableContext>
          <div className='w-full p-4'>
            <ProfileCard />
          </div>
        </div>
    </div> 
  )
}

export default SideBar