# Data Specs

For Clover

## Build

`npm run build`

## Start

`npm run start`

## Test (Unit and End-to-End)

`npm test`

## About

Directories containe data files and specification files. The specification files describe the structure of the data files. This app reads format definitions from specification files. It then uses these definitions to load the data files into a database.

## Tech Stack

- typescript
- sqlite
- sequelize (ORM)
- ava (testing)
- nyc (coverage)
- parcel (transpiling to Javascript)

## Limitations

If you run the app twice, it will insert duplicate data. We can't guarantee that arbitary data has unique fields, so if we want to stop this from happening, the best way is to go by filename.

After inserting data from a .txt file, the file could be renamed or moved, so that it's not accidently inserted again. Or the app could write the filename to a list of already-inserted files, and this list could be checked before inserts. Another, similar, option would be to create a hash of each file contents and check to see if the hash had already been created.

There's virtually no error checking in the app. If db connection or writes fail, this isn't dealt with. Nor is the more likely event of corrupt data in spec or data files. All of this stuff would be pretty trivial to add. Just busy work.

## Tasks

- [x] init project and add dependencies
- [x] connect to database
- [x] create tables
- [x] insert data
- [x] read file data
- [x] parse csv into model
- [x] parse data into insert objects
- [x] write unit tests
- [x] write e2e test
- [x] write run script that copies data to dist
- [x] finalize readme
- [x] test removing node_modules, dist and re-initializing

## Notes

Sequelize currently prints this message in the console, whether operators are used or not: `String based operators are now deprecated` See [https://github.com/sequelize/sequelize/issues/8417](https://github.com/sequelize/sequelize/issues/8417)
