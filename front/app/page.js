'use client'

import ProfileCard from '../ui/ProfileCard'
import AddTask from '../ui/AddTask'
import Days from '../ui/Days'

export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <ProfileCard />
      <AddTask />
      <Days />
    </>
  )
}
