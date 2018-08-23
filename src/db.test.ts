import test from 'ava'
import { storeDataFactory } from './db'
import { Datatype } from './enums'
import {
  IConnection,
  ITable,
  IModel,
  IInsertData,
  IFormats,
  IFormatRecord
} from './interfaces'

test('db::storeDataFactory', async (t) => {
  const createCalls = []
  const defineCalls = []
  let syncCallCount = 0

  const create = (...args) => {
    createCalls.push(args)
    return Promise.resolve(true)
  }

  const define = (...args): ITable => {
    defineCalls.push(args)
    return { create }
  }

  const sync = () => syncCallCount++

  const connection: IConnection = {
    define,
    sync
  }

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

  const formatRecords: IFormatRecord = {
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

  t.plan(3)
  await storeDataFactory(connection)(formats, formatRecords)
  t.is(syncCallCount, 2, 'sync called correct number of times')
  t.is(defineCalls.length, 2, 'define called correcr number of times')
  t.is(createCalls.length, 5, 'create called correct number of times')
})
