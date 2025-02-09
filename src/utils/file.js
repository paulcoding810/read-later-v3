/**
 * Save object to JSON file
 */
export function save2Json(data) {
  if (data) {
    // for v3, this is not working for service worker context
    const blob = new Blob([JSON.stringify(data)], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `read_later_${new Date().toDateString().replaceAll(' ', '_')}.json`
    link.click()
    link.remove()
  }
}
