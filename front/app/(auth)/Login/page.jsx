import React from 'react'
import { GoogleLogin, Register } from './Auth'
import { Login } from './Auth'

const AuthPage = () => {
  return (
    <>
      <Register />
      <Login />
      <GoogleLogin />
    </>
  )
}

export default AuthPage