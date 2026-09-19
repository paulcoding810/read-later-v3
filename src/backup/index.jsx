import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import '../tailwind.css'
import UploadIcon from '../assets/upload.svg?react'
import DownloadIcon from '../assets/download.svg?react'
import { messages } from '../background/message'
import { useDarkMode } from '../hooks/useDarkMode'
import { save2Json } from '../utils/file'

function sendImport(data) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: messages.IMPORT_DATA, data }, (response) => {
      resolve(response)
    })
  })
}

function exportJson() {
  chrome.runtime.sendMessage({ type: messages.EXPORT_DATA }, (response) => {
    if (response?.success) {
      save2Json(response.data)
    }
  })
}

function summarise({ tabs, groups, skipped }) {
  const added = [
    tabs && `${tabs} ${tabs === 1 ? 'tab' : 'tabs'}`,
    groups && `${groups} ${groups === 1 ? 'group' : 'groups'}`,
  ].filter(Boolean)

  if (added.length === 0) {
    return `Nothing new to add — all ${skipped} ${skipped === 1 ? 'entry was' : 'entries were'} already saved.`
  }
  return `Added ${added.join(' and ')}.${skipped ? ` Skipped ${skipped} already saved.` : ''}`
}

function Backup() {
  useDarkMode()
  const inputRef = useRef(null)
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setBusy(true)
    setStatus(null)
    try {
      const data = JSON.parse(await file.text())
      const response = await sendImport(data)
      if (response?.success) {
        setStatus({ ok: true, message: summarise(response.result) })
      } else {
        setStatus({ ok: false, message: response?.error ?? 'Import failed' })
      }
    } catch {
      setStatus({ ok: false, message: `${file.name} is not valid JSON` })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8 flex items-center gap-3">
          <img src="/img/logo-48.png" alt="" className="h-10 w-10" />
          <h1 className="m-0 text-2xl leading-tight font-semibold">Backup & restore</h1>
        </header>

        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-1 text-lg font-semibold">Restore from a backup</h2>
          <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Pick a JSON file exported from Read Later. Entries are merged into what you already have
            — a tab whose URL is saved, or a group whose name is taken, is left untouched.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFile}
          />
          <button
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600 disabled:opacity-60"
          >
            <UploadIcon aria-hidden="true" className="size-4 [&_path]:fill-current" />
            {busy ? 'Importing…' : 'Choose backup file'}
          </button>

          {status && (
            <p
              role="status"
              className={`mt-4 rounded-lg border px-4 py-3 text-sm leading-relaxed ${
                status.ok
                  ? 'border-green-300 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-900/30 dark:text-green-100'
                  : 'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-900/30 dark:text-red-100'
              }`}
            >
              {status.message}
            </p>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-1 text-lg font-semibold">Download a backup</h2>
          <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Writes your whole reading list and every group to a JSON file, the same one this page
            reads back.
          </p>
          <button
            onClick={exportJson}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <DownloadIcon
              aria-hidden="true"
              className="size-4 text-blue-500 dark:text-blue-300 [&_path]:fill-current"
            />
            Download backup
          </button>
        </section>
      </div>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <Backup />
  </React.StrictMode>,
)
