import test from 'ava'
import { join } from 'path'
import * as fs from 'fs'
import Sequelize = require('sequelize')
import { storeDataFactory } from './db'
import { readSpecFiles, readDataFiles } from './read'
import { getRecordsForFormats } from './parse'
import { dbPath } from './constants'

test('end-to-end', async (t) => {
  t.plan(2)
  const dbPath = join(__dirname, 'e2e.sqlite')
  const connection = new Sequelize(null, null, null, {
    dialect: 'sqlite',
    storage: dbPath
  })

  const storeData = storeDataFactory(connection)
  const formats = readSpecFiles()
  const data = readDataFiles()
  const records = getRecordsForFormats(data, formats)
  await storeData(formats, records)

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath
  })

  const query1Results = await sequelize.query('SELECT * FROM fileFormat1s')
  t.is(query1Results[0].length, 7, 'fileFormat1s query returned 7 records')
  const query2Results = await sequelize.query('SELECT * FROM fileFormat2s')
  t.is(query2Results[0].length, 3, 'fileFormat2s query returned 2 records')
  fs.unlinkSync(dbPath)
})
