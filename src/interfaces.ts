import Sequelize = require('sequelize')
import { Datatype } from './enums'

export type Value = boolean | number | string

export interface IInsertData {
  [key: string]: Value
}

export interface ITable {
  create: Function
}

export interface ITableRecord {
  name: string
  table: ITable
}

export interface IFS {
  readdirSync: (dir: string) => string[]
  readFileSync: (path: string, format: string) => string
}

export interface IConnection {
  define: (tableName: string, model: IModel) => ITable
  sync: Function
}

export interface IColumnFormat {
  columnName: string
  width: number
  datatype: Datatype
}

export interface IFormats {
  [key: string]: IColumnFormat[]
}

export interface IModel {
  [key: string]:
    | Sequelize.DataTypeText
    | Sequelize.DataTypeInteger
    | Sequelize.DataTypeFloat
    | Sequelize.DataTypeBoolean
}

export interface IRecord {
  columnName: string
  value: Value
  datatype: Datatype
}

export interface IRawDataRecord {
  name: string
  contents: string
}

export type Row = IRecord[]

export interface IFormatRecord {
  [key: string]: Row[]
}
