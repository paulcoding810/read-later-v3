import { messages } from '../background/message'

function openUrls(urls) {
  chrome.runtime.sendMessage({ type: messages.OPEN_GROUP_URLS, urls })
}

export default function Group({ name, urls }) {
  return (
    <div
      className="cursor-pointer rounded-lg border bg-white p-3 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      onClick={() => openUrls(urls)}
    >
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-blue-600 dark:text-blue-300">{name}</h2>
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          {urls.length}
        </span>
      </div>
      <ul className="space-y-0.5">
        {urls.map((url) => (
          <li key={url} className="truncate text-xs text-gray-600 dark:text-gray-400" title={url}>
            {url.startsWith('http') ? url : <span className="text-red-400">{url}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
