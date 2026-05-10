import { useEffect, useState } from 'react'
import backIcon from '../assets/arrow_back.svg'
import editIcon from '../assets/edit.svg'
import openInNewIcon from '../assets/open_in_new.svg'
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

export default function Groups({ setShowsGroups }) {
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
    <div className="bg-neutral-50 min-h-[400px]">
      <div className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500">
        {setShowsGroups && (
          <button
            onClick={() => setShowsGroups(false)}
            className="p-1 rounded outline-none hover:bg-blue-400"
          >
            <img src={backIcon} alt="Back" />
          </button>
        )}
        <span className="text-lg font-bold">Groups</span>
        <div className="flex-1" />
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-blue-400"
          >
            <img src={editIcon} alt="" className="w-4 h-4" />
            Edit
          </button>
        )}
        <button onClick={openInNewTab} className="p-1 rounded outline-none hover:bg-blue-400">
          <img src={openInNewIcon} alt="Open in new tab" />
        </button>
      </div>
      {editing ? (
        <GroupEditor
          groups={groups}
          setGroups={(newGroups) => setGroups(newGroups)}
          goBack={backFromEditor}
        />
      ) : groups.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400">No groups yet.</div>
      ) : (
        <div className="p-4 space-y-3">
          {groups.map(({ name, urls }) => (
            <Group key={name} {...{ name, urls }} />
          ))}
        </div>
      )}
    </div>
  )
}
