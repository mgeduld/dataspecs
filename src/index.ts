import { readSpecFiles, readDataFiles } from './read'
import { getRecordsForFormats } from './parse'
import { storeData } from './db'

const start = async () => {
  const formats = readSpecFiles()
  const data = readDataFiles()
  const records = getRecordsForFormats(data, formats)
  storeData(formats, records).then((results) => {
    console.log(`${results.length} records inserted.`)
  })
}

start()
