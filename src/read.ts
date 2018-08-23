import * as fs from 'fs'
import { join } from 'path'
import { dataDirectory, specDirectory } from './constants'
import { IColumnFormat, IFormats, IRawDataRecord } from './interfaces'
import { Datatype } from './enums'

const fileFormat = 'utf8'

export const getDataType = (rawDatatype: string) => {
  switch (rawDatatype.toUpperCase()) {
    case 'BOOLEAN':
      return Datatype.boolean
    case 'INTEGER':
      return Datatype.integer
    case 'FLOAT':
      return Datatype.float
    default:
      return Datatype.text
  }
}

export const convertCsvToObj = (csv: string): IColumnFormat[] => {
  const rows = csv.split('\n').slice(1)
  return rows.map(
    (row: string): IColumnFormat => {
      const [columnName, width, datatype] = row.split(',')
      const resolvedDataType = getDataType(datatype)
      return { columnName, width: Number(width), datatype: resolvedDataType }
    }
  )
}

export const readSpecFilesFactory = (fs) => (): IFormats => {
  const fileNames = fs.readdirSync(specDirectory)
  return fileNames.reduce((formats, fileName) => {
    const contents = fs.readFileSync(join(specDirectory, fileName), fileFormat)
    const formatName = fileName.split('.')[0]
    formats[formatName] = convertCsvToObj(contents)
    return formats
  }, {})
}

export const readSpecFiles = readSpecFilesFactory(fs)

export const readDataFilesFactory = (fs) => (): IRawDataRecord[] => {
  const fileNames = fs.readdirSync(dataDirectory)
  return fileNames.map((fileName) => ({
    name: fileName.split('_')[0],
    contents: fs.readFileSync(join(dataDirectory, fileName), fileFormat)
  }))
}

export const readDataFiles = readDataFilesFactory(fs)
