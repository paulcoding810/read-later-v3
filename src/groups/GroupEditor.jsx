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
    <div className="w-full h-full py-2">
      {error && <p className="mb-1 text-red-500">{error}</p>}
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="w-full h-[400px] p-2 font-mono text-xs border rounded resize-none"
      />
      <div className="flex flex-row justify-between mt-2">
        <button onClick={goBack} className="p-2 text-white bg-red-500 rounded hover:bg-red-600">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  )
}
