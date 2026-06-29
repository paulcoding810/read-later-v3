import { useState } from 'react'
import { groupDB } from '../helper'

export default function GroupEditor({ groups, setGroups, goBack }) {
  const [json, setJson] = useState(JSON.stringify(groups, null, 2))
  const [error, setError] = useState(null)

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(json)
      if (!Array.isArray(parsed)) throw new Error('Root must be an array')

      for (const group of parsed) {
        if (!group.name || typeof group.name !== 'string')
          throw new Error('Each group must have a "name" string')
        if (!Array.isArray(group.urls)) throw new Error('Each group must have a "urls" array')
      }

      const existing = await groupDB.getAll()
      for (const g of existing) {
        await groupDB.delete(g.id)
      }
      for (const group of parsed) {
        await groupDB.add({ name: group.name, urls: group.urls })
      }

      setGroups(parsed)
      goBack()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="h-full w-full py-2">
      {error && <p className="mb-1 text-red-500">{error}</p>}
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="h-[400px] w-full resize-none rounded-sm border p-2 font-mono text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      />
      <div className="mt-2 flex flex-row justify-between">
        <button onClick={goBack} className="rounded-sm bg-red-500 p-2 text-white hover:bg-red-600">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="rounded-sm bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  )
}
