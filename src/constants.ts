import { join } from 'path'

export const specDirectory =
  process.env.SPEC_DIRECTORY || join(__dirname, 'specs')

export const dataDirectory =
  process.env.DATA_DIRECTORY || join(__dirname, 'data')

export const dbPath = process.env.DB_DIRECTORY || join(__dirname, 'data.sqlite')
