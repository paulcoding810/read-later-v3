import { useState } from 'react'
import closeIcon from '../assets/close.svg'
import saveIcon from '../assets/save.svg'

export default function GroupEditor({ groups, setGroups, onCancel }) {
  const [text, setText] = useState(JSON.stringify(groups, null, 4))
  const [error, setError] = useState(null)

  function submit() {
    try {
      let newGroups = JSON.parse(text)
      setGroups(newGroups)
    } catch (error) {
      console.log(error)
      setError(error)
    }
  }
  return (
    <div className="px-4 py-2">
      <textarea
        className="w-full h-40 p-1 bg-transparent border-2 border-blue-500 rounded-lg outline-none resize-none"
        defaultValue={text}
        onChange={(e) => {
          setText(e.target.value)
          if (error) {
            setError(null)
          }
        }}
      />

      {error && <p className="text-sm text-red-500">{error.message}</p>}

      <div className="flex flex-row items-center gap-2">
        <button onClick={submit} className="p-2 rounded hover:bg-blue-200">
          <img src={saveIcon} alt="Save groups" />
        </button>

        <button onClick={onCancel} className="p-2 rounded hover:bg-red-200">
          <img src={closeIcon} alt="Close" />
        </button>
      </div>
    </div>
  )
}
