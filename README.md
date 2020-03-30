# SMS Parser

## Installation Steps

First step is to set up mongo server locally. Once you have a mongodb server up and running we can follow the following steps to import the necessarry files to mongo

```bash
    cd Data
    mongoimport --db qykly_dev --collection regexes --file regexes.json --jsonArray
    mongoimport --db qykly_dev --collection banks --file banks.json --jsonArray
    mongoimport --db qykly_dev --collection billers --file biller.json --jsonArray
    mongoimport --db qykly_dev --collection blacklisteds --file blacklisteds.json --jsonArray

```

Once import is done initialize npm in root directory

```bash
    npm install
    npx nodemon
```

This will start the server at <http://localhost:4000>
