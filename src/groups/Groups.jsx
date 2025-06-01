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
  return (await groupDB.getAll()).map((group) => ({ name: group.name, urls: group.urls })) // to avoid id field
}

export default function Groups({ setShowsGroups }) {
  const [groups, setGroups] = useState([])
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    getGroupsDatabase().then(setGroups)
  }, [])

  return (
    <div>
      {setShowsGroups && (
        <div className="flex flex-row items-center flex-1 gap-2 px-4 py-2 text-white bg-blue-500">
          <button
            onClick={() => setShowsGroups(false)}
            className="px-1 py-1 bg-transparent border-none rounded outline-none hover:bg-blue-200"
          >
            <img src={backIcon} alt="Back to tabs" />
          </button>
          <span className="text-lg font-bold">Groups</span>
          <div className="flex flex-1" />
          <button
            onClick={openInNewTab}
            className="px-1 py-1 bg-transparent border-none rounded outline-none hover:bg-blue-200"
          >
            <img src={openInNewIcon} alt="Open in new tab" />
          </button>
        </div>
      )}
      {editing ? (
        <GroupEditor
          groups={groups}
          setGroups={(newGroups) => {
            setGroups(newGroups)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="relative m-4">
          {groups.map(({ name, urls }) => (
            <Group key={name} {...{ name, urls }} />
          ))}
          <button
            onClick={() => setEditing(true)}
            className="absolute top-0 right-0 p-1 rounded hover:bg-blue-200"
          >
            <img src={editIcon} alt="Edit" />
          </button>
        </div>
      )}
    </div>
  )
}
