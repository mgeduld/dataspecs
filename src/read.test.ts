import test from 'ava'
import { Datatype } from './enums'
import { IColumnFormat, IFS, IFormats, IRawDataRecord } from './interfaces'
import {
  getDataType,
  convertCsvToObj,
  readSpecFilesFactory,
  readDataFilesFactory
} from './read'

test('read::getDataType', (t) => {
  t.is(getDataType('boolean'), Datatype.boolean, 'boolean -> Datatype.boolean')
  t.is(getDataType('BOOLEAN'), Datatype.boolean, 'BOOLEAN -> Datatype.boolean')
  t.is(getDataType('integer'), Datatype.integer, 'integer -> Datatype.integer')
  t.is(getDataType('INTEGER'), Datatype.integer, 'INTEGER -> Datatype.integer')
  t.is(getDataType('float'), Datatype.float, 'float -> Datatype.float')
  t.is(getDataType('FLOAT'), Datatype.float, 'FLOAT -> Datatype.float')
  t.is(getDataType('text'), Datatype.text, 'text -> Datatype.text')
  t.is(getDataType('TEXT'), Datatype.text, 'TEXT -> Datatype.text')
})

test('read::convertCsvToObj', (t) => {
  const csv =
    '"column name",width,datatype\nname,40,TEXT\nage,3,INTEGER\nmarried,5,BOOLEAN'
  const actual = convertCsvToObj(csv)
  const expected: IColumnFormat[] = [
    { columnName: 'name', width: 40, datatype: Datatype.text },
    { columnName: 'age', width: 3, datatype: Datatype.integer },
    { columnName: 'married', width: 5, datatype: Datatype.boolean }
  ]
  t.deepEqual(actual, expected)
})

test('read::readSpecFilesFactory', (t) => {
  const readdirSyncCalledWith = []
  const readFileSyncCalledWith = []
  const fs: IFS = {
    readdirSync: (args) => {
      readdirSyncCalledWith.push(args)
      return ['foo.csv', 'bar.csv']
    },
    readFileSync: (...args) => {
      readFileSyncCalledWith.push(args)
      return '"column name",width,datatype\nname,40,TEXT\nage,3,INTEGER\nmarried,5,BOOLEAN'
    }
  }
  const actual = readSpecFilesFactory(fs)()
  const expected: IFormats = {
    foo: [
      { columnName: 'name', width: 40, datatype: Datatype.text },
      { columnName: 'age', width: 3, datatype: Datatype.integer },
      { columnName: 'married', width: 5, datatype: Datatype.boolean }
    ],
    bar: [
      { columnName: 'name', width: 40, datatype: Datatype.text },
      { columnName: 'age', width: 3, datatype: Datatype.integer },
      { columnName: 'married', width: 5, datatype: Datatype.boolean }
    ]
  }
  t.is(readdirSyncCalledWith.length, 1, 'readdirSync called once')
  t.is(readFileSyncCalledWith.length, 2, 'readFileSync called twice')
  t.deepEqual(actual, expected, 'function returns the correct value')
})

test('read::readDataFilesFactory', (t) => {
  const readdirSyncCalledWith = []
  const readFileSyncCalledWith = []
  const fs: IFS = {
    readdirSync: (args) => {
      readdirSyncCalledWith.push(args)
      return ['foo_some-date.txt', 'bar_some-date.txt']
    },
    readFileSync: (...args) => {
      readFileSyncCalledWith.push(args)
      return 'foo'
    }
  }
  const actual = readDataFilesFactory(fs)()
  const expected: IRawDataRecord[] = [
    { name: 'foo', contents: 'foo' },
    { name: 'bar', contents: 'foo' }
  ]
  t.is(readdirSyncCalledWith.length, 1, 'readdirSync called once')
  t.is(readFileSyncCalledWith.length, 2, 'readFileSync called twice')
  t.deepEqual(actual, expected, 'function returns the correct value')
})
