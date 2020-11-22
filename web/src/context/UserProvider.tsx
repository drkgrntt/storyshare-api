import { useEffect, useState } from 'react'
import { useMeQuery } from '../hooks/useMeQuery'
import userContext from './userContext'
import { User } from '../types'

const UserProvider: React.FC<{}> = (props) => {

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const setToken = (token?: string) => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  const result = useMeQuery()

  useEffect(() => {
    switch (true) {
      case !!result.error:
        setCurrentUser(null)
        break
      case !!result.data:
        setCurrentUser(result.data.me)
        break
    }
  }, [result])

  return (
    <userContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        setToken
      }}
    >
      {props.children}
    </userContext.Provider>
  )
}

export default UserProvider
