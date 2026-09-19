import React from 'react'
import ReactDOM from 'react-dom/client'
import '../tailwind.css'
import { useDarkMode } from '../hooks/useDarkMode'
import { isFirefox } from '../utils/browser'
import { createTab } from '../utils/tabs'

function Key({ children }) {
  return (
    <kbd className="rounded-sm border border-gray-300 bg-gray-100 px-1.5 py-0.5 font-sans text-xs whitespace-nowrap text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
      {children}
    </kbd>
  )
}

function Combo({ keys }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && <span className="text-gray-400 dark:text-gray-500">+</span>}
          <Key>{key}</Key>
        </React.Fragment>
      ))}
    </span>
  )
}

function Section({ title, description, children }) {
  return (
    <section className="mb-8">
      <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      {description && (
        <p className="mb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      <dl className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
        {children}
      </dl>
    </section>
  )
}

function Row({ trigger, children }) {
  return (
    <div className="flex flex-col gap-1 bg-white px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4 dark:bg-gray-800">
      <dt className="sm:w-52 sm:shrink-0">{trigger}</dt>
      <dd className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{children}</dd>
    </div>
  )
}

function Usage() {
  useDarkMode()

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8 flex items-center gap-3">
          <img src="/img/logo-48.png" alt="" className="h-10 w-10" />
          <h1 className="m-0 text-2xl leading-tight font-semibold">Read Later shortcuts</h1>
        </header>

        <Section
          title="Keyboard shortcuts"
          description="Suggested defaults — your browser may have assigned something else if a key was already taken."
        >
          <Row trigger={<Combo keys={['Ctrl', 'B']} />}>
            Save every highlighted tab in the current window. Tabs already saved are skipped, and
            the badge flashes green for a new save or orange for a duplicate.
          </Row>
          <Row trigger={<Combo keys={['Ctrl', 'Shift', 'B']} />}>Open the Read Later popup.</Row>
        </Section>

        <p className="-mt-4 mb-8 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Both use the actual <Key>Control</Key> key on macOS, not <Key>⌘</Key>.{' '}
          {isFirefox() ? (
            <>
              To rebind them, open{' '}
              <code className="rounded-sm border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs dark:border-gray-600 dark:bg-gray-700">
                about:addons
              </code>{' '}
              in the address bar, click the gear icon, and choose{' '}
              <strong className="text-gray-900 dark:text-gray-100">
                Manage Extension Shortcuts
              </strong>
              . On Windows, note that <Combo keys={['Ctrl', 'B']} /> also opens the Bookmarks
              Sidebar, so you may want a different key here.
            </>
          ) : (
            <>
              To rebind them, open{' '}
              <button
                onClick={() => createTab('chrome://extensions/shortcuts', true)}
                className="cursor-pointer rounded-sm border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs text-blue-600 underline-offset-2 hover:underline dark:border-gray-600 dark:bg-gray-700 dark:text-blue-300"
              >
                chrome://extensions/shortcuts
              </button>
              .
            </>
          )}
        </p>

        <Section
          title="Opening a saved tab"
          description="Modifiers on a row in the saved list. They combine — Shift + Ctrl opens privately and removes the entry."
        >
          <Row trigger={<Combo keys={['Click']} />}>
            Open in a background tab, right after the current one. The entry stays in the list.
          </Row>
          <Row trigger={<Combo keys={['Shift', 'Click']} />}>
            Open in a new private window instead.
          </Row>
          <Row trigger={<Combo keys={['Ctrl / Alt / ⌘', 'Click']} />}>
            Open in a background tab and remove the entry from the list.
          </Row>
          <Row trigger={<span className="text-sm text-gray-700 dark:text-gray-300">Hover</span>}>
            Reveals a copy button for the URL and a remove button, in the top-right of the row.
          </Row>
        </Section>

        <Section
          title="Groups"
          description="A group is a named list of URLs you can reopen in one click."
        >
          <Row
            trigger={
              <span className="text-sm text-gray-700 dark:text-gray-300">Click a group</span>
            }
          >
            Open every URL in it, staggered a quarter-second apart so the browser keeps up.
          </Row>
          <Row trigger={<span className="text-sm text-gray-700 dark:text-gray-300">Edit</span>}>
            Edit all groups as raw JSON. Saving replaces the whole set, so removing an entry there
            deletes that group.
          </Row>
          <Row trigger={<Combo keys={['Esc']} />}>Leave the group editor without saving.</Row>
        </Section>

        <Section title="Popup menu" description="Behind the ⋯ button, next to the search box.">
          <Row
            trigger={
              <span className="text-sm text-gray-700 dark:text-gray-300">Add Current Tab</span>
            }
          >
            Same as <Combo keys={['Ctrl', 'B']} />, without the keyboard.
          </Row>
          <Row
            trigger={<span className="text-sm text-gray-700 dark:text-gray-300">Export Data</span>}
          >
            Download every saved tab and group as a JSON file.
          </Row>
          <Row
            trigger={
              <span className="text-sm text-gray-700 dark:text-gray-300">Copy All URLs</span>
            }
          >
            Copy the URLs of the currently highlighted tabs as a JSON array — the open tabs, not the
            saved ones.
          </Row>
          <Row
            trigger={
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Invalidate Icon Cache
              </span>
            }
          >
            Drop every cached favicon. They are refetched, or re-read from your open tabs, as rows
            render again.
          </Row>
        </Section>

        <Section title="Search" description="The box is focused the moment the popup opens.">
          <Row
            trigger={
              <span className="text-sm text-gray-700 dark:text-gray-300">Type anything</span>
            }
          >
            Fuzzy-matches against both the title and the URL of saved tabs, so approximate spelling
            still finds the page.
          </Row>
        </Section>
      </div>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <Usage />
  </React.StrictMode>,
)
