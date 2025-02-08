import { setValue } from '../utils/storage'
import devDB from './devdb'

console.log('background is running')
chrome.runtime.onInstalled.addListener(() => {
  if (import.meta.env.DEV === true) {
    setValue(devDB)
      .then(() => {
        console.log('Import devDB successfully')
      })
      .catch((error) => {
        console.error(`Failed to set devDB: ${error}`)
      })
  }
})

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
})
