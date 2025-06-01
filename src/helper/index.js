import IndexedDBWrapper from './IDB'

/** 
Read Later table

| title                                     | url                                | date (timestamp) |
|-------------------------------------------|------------------------------------|------------------|
| GitHub - oumi-ai/oumi                     | https://github.com/oumi-ai/oumi    | 1738596650154    |


Groups table

| name     | urls                                                                                                                |
|----------|---------------------------------------------------------------------------------------------------------------------|
| trending | [ "https://github.com/search?o=desc&q=stars%3A%3E%3D20+fork%3Atrue+language%3Akotlin&s=updated&type=Repositories", |
|          |   "https://github.com/trending" ]                                                                                  |
*/

const readLaterIndexKey = 'urlIndex'
const groupIndexKey = 'nameIndex'

const readLaterDB = new IndexedDBWrapper('ReadLater', 'read_later', 1, [
  { name: readLaterIndexKey, keyPath: 'url', options: { unique: true } },
])

const groupDB = new IndexedDBWrapper('Group', 'groups', 1, [
  { name: groupIndexKey, keyPath: 'name', options: { unique: true } },
])

async function syncStorageToDB() {
  const storage = await chrome.storage.local.get()

  const { read_later: readLater, groups } = storage

  if (readLater) {
    for (const item of readLater) {
      await readLaterDB.add(item)
    }
  }

  if (groups) {
    for (const group of Object.keys(groups)) {
      await groupDB.add({ name: group, urls: groups[group] })
    }
  }
}

export { groupDB, readLaterDB, syncStorageToDB }

globalThis['readLaterDB'] = readLaterDB
globalThis['groupDB'] = groupDB
