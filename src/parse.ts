import Sequalize = require('sequelize')
import { Datatype } from './enums'
import {
  IRecord,
  Value,
  IFormats,
  IRawDataRecord,
  IModel,
  IColumnFormat,
  IFormatRecord,
  Row
} from './interfaces'

export const castValue = (value, datatype): Value => {
  switch (datatype) {
    case Datatype.boolean:
      return value.toLowerCase() === 'false' || value === '0' ? false : true
    case Datatype.float:
      return isNaN(value) ? 0 : Number(value)
    case Datatype.integer:
      return isNaN(value) ? 0 : Math.round(Number(value))
    default:
      return value
  }
}

export const recordReducer = (datum) => (
  accumulator,
  field
): { charCursor: number; records: IRecord[] } => {
  const { columnName, width, datatype } = field
  const value = castValue(
    datum.substr(accumulator.charCursor, width).trim(),
    datatype
  )
  accumulator.charCursor += width
  accumulator.records.push({ columnName, value, datatype })
  return accumulator
}

export const getRecordsForFormat = (
  data: string,
  format: IColumnFormat[]
): Row[] => {
  return data.split('\n').map((datum: string) => {
    const reducerResult = format.reduce(recordReducer(datum), {
      records: [],
      charCursor: 0
    })
    return reducerResult.records
  })
}

export const getRecordsForFormats = (
  data: IRawDataRecord[],
  formats: IFormats
): IFormatRecord => {
  return data.reduce((formatRecords, { name, contents }) => {
    formatRecords[name] = [
      ...(formatRecords[name] || []),
      ...getRecordsForFormat(contents, formats[name])
    ]
    return formatRecords
  }, {})
}

const typeMap = {
  [Datatype.text]: Sequalize.TEXT,
  [Datatype.boolean]: Sequalize.BOOLEAN,
  [Datatype.integer]: Sequalize.INTEGER
}

export const getModelFromFormats = (columnFormats: IColumnFormat[]): IModel => {
  return columnFormats.reduce((model, { columnName, datatype }) => {
    return { ...model, [columnName]: typeMap[datatype] }
  }, {})
}
