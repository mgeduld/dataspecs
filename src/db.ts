import Sequalize = require('sequelize')
import { flatten } from 'lodash'
import { dbPath } from './constants'
import { getModelFromFormats } from './parse'
import {
  IConnection,
  ITable,
  ITableRecord,
  IRecord,
  IColumnFormat,
  IFormats,
  IFormatRecord,
  IModel,
  IInsertData
} from './interfaces'

const createTableFactory = (connection: IConnection) => async (
  tableName: string,
  model: IModel
): Promise<ITableRecord> => {
  const table: ITable = connection.define(tableName, model)
  await connection.sync()
  return Promise.resolve({ table, name: tableName })
}

const insertIntoTableFactory = (connection: IConnection) => (
  table: ITable,
  columnFormats: IColumnFormat[],
  data: IRecord[]
) => {
  const insertData = data.reduce((row, datum, index): IInsertData => {
    const { columnName } = columnFormats[index]
    row[columnName] = datum.value
    return row
  }, {})

  return table.create(insertData)
}

export const storeDataFactory = (connection: IConnection) => async (
  formats: IFormats,
  formatRecords: IFormatRecord
) => {
  // Create tables
  const createTable = createTableFactory(connection)
  const promises = Object.keys(formats).map((key: string) => {
    const model = getModelFromFormats(formats[key])
    return createTable(key, model)
  })
  const tables = await Promise.all(promises)
  const insertIntoTable = insertIntoTableFactory(connection)
  const allInserts = tables.map(({ name, table }) => {
    const records = formatRecords[name]
    return records.map((row) => {
      return insertIntoTable(table, formats[name], row)
    })
  })
  return Promise.all(flatten(allInserts))
}

const connection = new Sequalize(null, null, null, {
  dialect: 'sqlite',
  storage: dbPath
})

export const storeData = storeDataFactory(connection)
