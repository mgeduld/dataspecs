import test from 'ava'
import Sequalize = require('sequelize')
import {
  castValue,
  getRecordsForFormat,
  recordReducer,
  getRecordsForFormats,
  getModelFromFormats
} from './parse'
import { Datatype } from './enums'
import {
  IRawDataRecord,
  IFormats,
  IFormatRecord,
  IColumnFormat
} from './interfaces'

test('parse::castValue', (t) => {
  t.is(castValue('0', Datatype.boolean), false, 'casts "0" (boolean) to false')
  t.is(castValue('1', Datatype.boolean), true, 'casts "1" (boolean) to true')
  t.is(
    castValue('-55', Datatype.boolean),
    true,
    'casts "-55" (boolean) to true'
  )
  t.is(castValue('55', Datatype.boolean), true, 'casts "55" (boolean) to true')
  t.is(
    castValue('banaba', Datatype.boolean),
    true,
    'casts "banana" (boolean) to true'
  )
  t.is(castValue('false', Datatype.boolean), false, 'casts "false" to false')
  t.is(castValue('FALSE', Datatype.boolean), false, 'casts "FALSE" to false')
  t.is(castValue('true', Datatype.boolean), true, 'casts "true" to true')
  t.is(castValue('TRUE', Datatype.boolean), true, 'casts "TRUE" to true')
  t.is(castValue('0', Datatype.integer), 0, 'casts "0" (integer) to 0')
  t.is(castValue('27', Datatype.integer), 27, 'casts "27" (integer) to 27')
  t.is(castValue('-27', Datatype.integer), -27, 'casts "-27" (integer) to -27')
  t.is(castValue('27.5', Datatype.integer), 28, 'casts "27.5" (integer) to 28')
  t.is(castValue(NaN, Datatype.integer), 0, 'casts NaN (integer) to 0')
  t.is(castValue(NaN, Datatype.float), 0, 'casts NaN (float) to 0')
  t.is(
    castValue('27.5', Datatype.float),
    27.5,
    'casts "27.5" (integer) to 27.5'
  )
  t.is(
    castValue('hello world', Datatype.text),
    'hello world',
    'casts "hello world" (text) to "hello world"'
  )
})

test('parse::recordReducer', (t) => {
  const actual = recordReducer('foo  bar    baz')(
    { records: [], charCursor: 5 },
    { columnName: 'a', width: 7, datatype: 'TEXT' }
  )
  t.deepEqual(actual, {
    records: [{ columnName: 'a', value: 'bar', datatype: Datatype.text }],
    charCursor: 12
  })
})

test('parse::getRecordsForFormat', (t) => {
  const data = `foo    088
moops  1123
abababa15000`

  const format = [
    { columnName: 'a', width: 7, datatype: 'TEXT' as Datatype },
    { columnName: 'b', width: 1, datatype: 'BOOLEAN' as Datatype },
    { columnName: 'c', width: 6, datatype: 'INTEGER' as Datatype }
  ]
  const actual = getRecordsForFormat(data, format)
  const expected = [
    [
      { columnName: 'a', value: 'foo', datatype: Datatype.text },
      { columnName: 'b', value: false, datatype: Datatype.boolean },
      { columnName: 'c', value: 88, datatype: Datatype.integer }
    ],
    [
      { columnName: 'a', value: 'moops', datatype: Datatype.text },
      { columnName: 'b', value: true, datatype: Datatype.boolean },
      { columnName: 'c', value: 123, datatype: Datatype.integer }
    ],
    [
      { columnName: 'a', value: 'abababa', datatype: Datatype.text },
      { columnName: 'b', value: true, datatype: Datatype.boolean },
      { columnName: 'c', value: 5000, datatype: Datatype.integer }
    ]
  ]
  t.deepEqual(actual, expected)
})

test('parse::getRecordsForFormats', (t) => {
  const data: IRawDataRecord[] = [
    { name: 'cats', contents: 'Percy  7true\nOscar  7false\nBee    1false' },
    { name: 'balloons', contents: 'Large red\nSmall blue' }
  ]
  const formats: IFormats = {
    cats: [
      { columnName: 'name', width: 7, datatype: Datatype.text },
      { columnName: 'age', width: 1, datatype: Datatype.integer },
      { columnName: 'likes catnip', width: 5, datatype: Datatype.boolean }
    ],
    balloons: [
      { columnName: 'size', width: 5, datatype: Datatype.text },
      { columnName: 'color', width: 10, datatype: Datatype.text }
    ]
  }
  const actual = getRecordsForFormats(data, formats)
  const expected: IFormatRecord = {
    cats: [
      [
        { columnName: 'name', value: 'Percy', datatype: Datatype.text },
        { columnName: 'age', value: 7, datatype: Datatype.integer },
        { columnName: 'likes catnip', value: true, datatype: Datatype.boolean }
      ],
      [
        { columnName: 'name', value: 'Oscar', datatype: Datatype.text },
        { columnName: 'age', value: 7, datatype: Datatype.integer },
        { columnName: 'likes catnip', value: false, datatype: Datatype.boolean }
      ],
      [
        { columnName: 'name', value: 'Bee', datatype: Datatype.text },
        { columnName: 'age', value: 1, datatype: Datatype.integer },
        { columnName: 'likes catnip', value: false, datatype: Datatype.boolean }
      ]
    ],
    balloons: [
      [
        { columnName: 'size', value: 'Large', datatype: Datatype.text },
        { columnName: 'color', value: 'red', datatype: Datatype.text }
      ],
      [
        { columnName: 'size', value: 'Small', datatype: Datatype.text },
        { columnName: 'color', value: 'blue', datatype: Datatype.text }
      ]
    ]
  }

  t.deepEqual(actual, expected)
})

test('parse::getModelFromFormats', (t) => {
  const columnFormats: IColumnFormat[] = [
    { columnName: 'name', width: 7, datatype: Datatype.text },
    { columnName: 'age', width: 1, datatype: Datatype.integer },
    { columnName: 'likes catnip', width: 5, datatype: Datatype.boolean }
  ]
  const actual = getModelFromFormats(columnFormats)
  const expected = {
    name: Sequalize.TEXT,
    age: Sequalize.INTEGER,
    'likes catnip': Sequalize.BOOLEAN
  }
  t.deepEqual(actual, expected)
})
