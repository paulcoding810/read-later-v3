import { useEffect, useState } from 'react'
import closeIcon from '../assets/close.svg'
import saveIcon from '../assets/save.svg'
import { isURL } from '../utils/url'

const urlsStringToArray = (urlsString) => {
  return urlsString
    .trim()
    .split('\n')
    .filter(isURL)
    .map((url) => url.trim())
}

export default function GroupEditor({ groups, setGroups, goBack }) {
  const [error, setError] = useState(null)
  const [showAddGroup, setShowAddGroup] = useState(false)

  const updateGroup = async (group, callback) => {
    try {
      if (!group.id) {
        throw new Error('Group must have an id')
      }
      await groupDB.update(group)
      callback?.()
    } catch (error) {
      console.error('Error updating group:', error)
      setError(error)
    }
  }

  const addGroup = async (group) => {
    try {
      await groupDB.add(group)
      setGroups((prevGroups) => [group, ...prevGroups])
      goBack()
    } catch (error) {
      console.error('Error adding group:', error)
      setError(error)
    }
  }

  const deleteGroup = async (groupId) => {
    try {
      await groupDB.delete(groupId)
      setGroups((prevGroups) => prevGroups.filter((g) => g.id !== groupId))
    } catch (error) {
      console.error('Error deleting group:', error)
      setError(error)
    }
  }

  return (
    <div className="w-full h-full px-4 py-2">
      <div className="h-4">
        {error && <p className="self-center text-red-500">{error.message}</p>}
      </div>
      {showAddGroup && (
        <AddGroupForm
          onSubmit={(group) => {
            setShowAddGroup(false)
            addGroup(group)
          }}
          onError={(error) => setError(error)}
          onCancel={() => setShowAddGroup(false)}
        />
      )}
      {groups.map((group, index) => (
        <EditableGroup
          key={index}
          group={group}
          onChange={updateGroup}
          onDelete={() => {
            deleteGroup(group.id)
          }}
          onError={(error) => setError(error)}
        />
      ))}
      <div className="flex flex-row justify-between ">
        <button
          onClick={() => setShowAddGroup(!showAddGroup)}
          className="p-2 mt-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Add Group
        </button>
        <button
          onClick={goBack}
          className="p-2 mt-2 text-white bg-red-500 rounded hover:bg-red-600"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

const AddGroupForm = ({ onSubmit, onCancel, onError }) => {
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupUrls, setNewGroupUrls] = useState('')

  const submit = () => {
    if (!newGroupName.trim()) {
      onError(new Error('Group name cannot be empty'))
      return
    }

    const urlsArray = urlsStringToArray(newGroupUrls)
    if (urlsArray.length === 0) {
      onError(new Error('At least one valid URL is required'))
      return
    }

    onSubmit({ name: newGroupName, urls: urlsArray })
  }

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="flex flex-col items-center self-center flex-grow-0 w-full p-4 mx-4 bg-blue-200 rounded">
        <h2 className="text-lg font-semibold">Add New Group</h2>
        <input
          type="text"
          autoFocus
          placeholder="Group Name"
          className="w-full p-1 mb-2 border rounded"
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <textarea
          placeholder="URLs (one per line)"
          className="w-full h-20 p-1 mb-2 border rounded resize-none"
          onChange={(e) => setNewGroupUrls(e.target.value)}
        />
        <div className="flex flex-row gap-8">
          <button
            type="button"
            onClick={submit}
            className="p-1 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Add Group
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-white bg-red-500 rounded hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const EditableGroup = ({ group, onChange, onDelete, onError }) => {
  const [name, setName] = useState(group.name)
  const [urls, setUrls] = useState(group.urls.join('\n'))
  const [isEdited, setIsEdited] = useState(name !== group.name || urls !== group.urls.join('\n'))

  useEffect(() => {
    setIsEdited(name !== group.name || urls !== group.urls.join('\n'))
  }, [name, urls])

  const handleSave = () => {
    const urlsArray = urlsStringToArray(urls)
    if (urlsArray.length === 0) {
      onError(new Error('At least one valid URL is required'))
      return
    }
    onChange({ ...group, name, urls: urls.split('\n') }, () => {
      setIsEdited(false)
    })
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the group "${group.name}"?`)) {
      onDelete()
    }
  }

  return (
    <div
      className={`relative my-4 p-4 border rounded ${isEdited ? 'border-orange-500' : 'border-gray-300'}`}
    >
      <div className="absolute flex flex-row items-center h-10 px-2 space-x-2 rounded bg-neutral-50 -top-4 left-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-1 font-semibold bg-white border border-gray-300 border-none rounded outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="absolute flex flex-row items-center h-10 px-2 rounded bg-neutral-50 -top-4 right-2">
        {isEdited && (
          <button
            onClick={handleSave}
            className="p-2 text-blue-500 rounded hover:bg-blue-100 focus:ring-2 focus:ring-blue-500"
          >
            <img src={saveIcon} alt="Save Group" title="Save Group" className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="p-2 text-red-500 rounded hover:bg-red-100 focus:ring-2 focus:ring-red-500"
        >
          <img src={closeIcon} alt="Remove Group" title="Remove Group" className="w-5 h-5" />
        </button>
      </div>
      <textarea
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        className="w-full h-24 p-2 mt-4 border border-gray-300 rounded resize-none focus:ring-blue-500"
      />
    </div>
  )
}
