import { createTab } from '../utils/tabs'

function openUrls(urls) {
  urls.toReversed().forEach((url, index) => {
    setTimeout(() => createTab(url), index * 250)
  })
}

export default function Group({ name, urls }) {
  return (
    <div
      className="bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => openUrls(urls)}
    >
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-semibold text-blue-600">{name}</h2>
        <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
          {urls.length}
        </span>
      </div>
      <ul className="space-y-0.5">
        {urls.map((url) => (
          <li key={url} className="text-xs text-gray-600 truncate" title={url}>
            {url.startsWith('http') ? url : <span className="text-red-400">{url}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
