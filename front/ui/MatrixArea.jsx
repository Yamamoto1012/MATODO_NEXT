import React from 'react'
import { useDroppable } from '@dnd-kit/core'

export function MatrixArea () {
  const { setNodeRef : setFirstDrpppableRef} = useDroppable({
    id: 'matrix-effective',
  });
  const { setNodeRef : setSecondDrpppableRef} = useDroppable({
    id: 'matrix-requre',
  });
  const { setNodeRef : setThirdDrpppableRef} = useDroppable({
    id: 'matrix-waste',
  });
  const { setNodeRef : setForthDrpppableRef} = useDroppable({
    id: 'matrix-illusion',
  });

  return (
    <div className='grid grid-cols-2 grid-rows-2 gap-2 p-4 w-[600px] h-[400px] md:w-[700px] md:h-[500px] lg:w-[800px] lg:h-[600px] mt-[50px]'>
      {/* 4色のマトリクス */}
      <div 
        className='bg-blue-500 w-full h-full flex justify-center items-center'
        ref ={setFirstDrpppableRef}
      >1
      </div>
      <div 
        className='bg-red-500 w-full h-full flex justify-center items-center'
        ref ={setSecondDrpppableRef}
      >2
      </div>
      <div 
        className='bg-gray-500 w-full h-full flex justify-center items-center'
        ref ={setThirdDrpppableRef}
      >3
      </div>
      <div 
        className='bg-yellow-500 w-full h-full flex justify-center items-center'
        ref ={setForthDrpppableRef}
      >4
      </div>
    </div>
  )
}

export default MatrixArea