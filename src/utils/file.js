/**
 * Save object to JSON file
 */
export function save2Json(data) {
  if (data) {
    // not working for v3
    // const blob = new Blob([JSON.stringify(data)], { type: 'text/plain' })
    // const url = URL.createObjectURL(blob)

    const url = `data:,${JSON.stringify(data, null, 2)}`
    chrome.downloads.download({
      url: url,
      filename: `read_later_${new Date().toDateString().replaceAll(' ', '_')}.json`,
      saveAs: true,
    })
  }
}
