import { useEffect, useState } from 'react'
import BackIcon from '../assets/arrow_back.svg?react'
import EditIcon from '../assets/edit.svg?react'
import OpenInNewIcon from '../assets/open_in_new.svg?react'
import { groupDB } from '../helper'
import { createTab } from '../utils/tabs'
import Group from './Group'
import GroupEditor from './GroupEditor'

function openInNewTab() {
  createTab(chrome.runtime.getURL('groups.html'), true)
  setTimeout(() => {
    window.close()
  }, 250)
}

async function getGroupsDatabase() {
  return await groupDB.getAll()
}

const sampleGroups = [
  {
    name: 'read later',
    urls: ['https://github.com/paulcoding810/read-later-v3'],
  },
]

export default function Groups({ setShowsGroups, darkMode }) {
  const [groups, setGroups] = useState([])
  const [editing, setEditing] = useState(false)

  function backFromEditor() {
    getGroupsDatabase().then(setGroups)
    setEditing(false)
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      backFromEditor()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    getGroupsDatabase().then(setGroups)
  }, [])

  return (
    <div className="min-h-100 bg-neutral-50 dark:bg-gray-900">
      <div className="flex items-center gap-2 bg-blue-500 px-4 py-2 text-white dark:bg-blue-900">
        {setShowsGroups && (
          <button
            onClick={() => setShowsGroups(false)}
            className="rounded-sm p-1 outline-hidden hover:bg-blue-400 dark:hover:bg-blue-800"
          >
            <BackIcon className="size-4 text-gray-100 dark:text-gray-300" />
          </button>
        )}
        <span className="text-sm text-gray-100 dark:text-gray-300">Groups</span>
        <div className="flex-1" />
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 rounded-sm px-2 py-1 text-sm text-gray-100 hover:bg-blue-400 dark:text-gray-300 dark:hover:bg-blue-700"
          >
            <EditIcon className="size-4 text-gray-100 dark:text-gray-300" />
            Edit
          </button>
        )}
        <button
          onClick={openInNewTab}
          className="rounded-sm p-1 outline-hidden hover:bg-blue-400 dark:hover:bg-blue-700"
        >
          <OpenInNewIcon className="size-4 text-gray-100 dark:text-gray-300" />
        </button>
      </div>
      {editing ? (
        <GroupEditor
          groups={groups}
          setGroups={(newGroups) => setGroups(newGroups)}
          goBack={backFromEditor}
        />
      ) : groups.length === 0 ? (
        <div className="flex flex-col gap-3 p-4 text-gray-500 dark:text-gray-400">
          <div className="text-sm">No groups added. Sample group:</div>
          <pre className="max-h-56 overflow-auto rounded-sm border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {JSON.stringify(sampleGroups, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="space-y-3 p-4">
          {groups.map(({ name, urls }) => (
            <Group key={name} {...{ name, urls }} />
          ))}
        </div>
      )}
    </div>
  )
}
