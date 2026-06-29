import React from 'react'
import ReactDOM from 'react-dom/client'
import '../tailwind.css'
import { useDarkMode } from '../hooks/useDarkMode'
import Groups from './Groups'

function GroupsPage() {
  const { darkMode } = useDarkMode()

  return <Groups darkMode={darkMode} />
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <GroupsPage />
  </React.StrictMode>,
)
