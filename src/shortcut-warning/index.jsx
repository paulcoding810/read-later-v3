import React from 'react'
import ReactDOM from 'react-dom/client'
import '../tailwind.css'

function ShortcutWarning() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8 text-gray-900">
      <section className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <header className="mb-6 flex items-center gap-3">
          <img src="/img/logo-48.png" alt="Read Later" className="h-10 w-10" />
          <h1 className="m-0 text-2xl font-semibold leading-tight">Read Later shortcut notice</h1>
        </header>

        <p className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 leading-relaxed text-amber-900">
          On Windows Firefox, the default{' '}
          <kbd className="rounded border border-amber-300 bg-white px-1.5 py-0.5 text-sm">
            Ctrl + B
          </kbd>{' '}
          shortcut opens the Bookmarks Sidebar, so it may not save the current tab in Read Later.
        </p>

        <p className="mb-4 leading-relaxed text-gray-700">
          To choose a different shortcut for Read Later:
        </p>

        <ol className="ml-6 list-decimal space-y-2 leading-relaxed text-gray-700">
          <li>
            Navigate to{' '}
            <code className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-gray-900">
              about:addons
            </code>{' '}
            by typing it in the address bar.
          </li>
          <li>Click the settings gear icon.</li>
          <li>
            Select <strong className="text-gray-900">Manage Extension Shortcuts</strong>.
          </li>
          <li>Update the Read Later shortcut to your preferred key combination.</li>
        </ol>
      </section>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <ShortcutWarning />
  </React.StrictMode>,
)
