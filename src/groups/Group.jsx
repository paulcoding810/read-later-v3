import { createTab } from '../utils/tabs'

function openUrls(urls) {
  urls.toReversed().forEach((url, index) => {
    setTimeout(() => createTab(url), index * 250)
  })
}

export default function Group({ name, urls }) {
  return (
    <div
      className="flex flex-col px-2 py-1 rounded-lg justify-center gap-2 hover:cursor-pointer hover:bg-blue-200 hover:*:bg-opacity-25"
      onClick={() => {
        openUrls(urls)
      }}
    >
      <h2 className="w-full text-sm font-semibold text-blue-500 ">{name}</h2>
      <ul className="ml-4">
        {urls.map((url) => (
          <li
            key={url}
            className={`px-1 py-1 text-[11px] text-wrap overflow-hidden text-ellipsis break-words line-clamp-2 ${!url.startsWith('http') ? 'text-red-400' : ''}`}
          >
            {url}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  )
}
