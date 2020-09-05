[mongoose-auto-api.rest](README.md) › [Globals](globals.md)

# mongoose-auto-api.rest

# Mongoose Auto API - Rest API Module

[![Build Status](https://travis-ci.org/edmundpf/mongoose-auto-api-rest.svg?branch=master)](https://travis-ci.org/edmundpf/mongoose-auto-api-rest)
[![npm version](https://badge.fury.io/js/mongoose-auto-api.rest.svg)](https://badge.fury.io/js/mongoose-auto-api.rest)

> Automatic Mongoose REST API - Rest API Module ☕

## Install

- `npm i -S mongoose-auto-api.rest`

## Model Setup

- [Model Setup - mongoose-auto-api.info](https://github.com/edmundpf/mongoose-auto-api-info/blob/master/README.md#model-setup)

## Usage

```javascript
// Common JS
const api = require('mongoose-auto-api.rest').default

// ES6+ and Typescript
import api from 'mongoose-auto-api.rest'
```

## Server/CORS Ports

- assign port with _serverPort_ field in apiConfig.json
  - Runs on this port in production, and this port + 10 by default in development, override with **PORT** environment variable
- assign cors port (port of your web application) with _webPort_ field in apiConfig.json
  - Allows cors on this port in production, and this port + 10 by default in development, override with **PORT** environment variable

## REST API Details

- Uses JSON Web Tokens for verification
  - Tokens last 7 days and are refreshed every hour upon api use

## General

- JSON response will contain `{"status": "ok"}` on success, and `{"status": "error"}` on error.
- JSON response will contain _response_ field with extra data i.e. `{"status": "ok", "response": {"message": "success"}}`
- JSON response will contain _refresh_token_ field with refresh token: `{"refresh_token": { username, uid, access_token, expires_in }}`
- Routes require JWT to authenticate
  - Token can be sent in request with parameter `?auth_token=xxx`, in _x-access-token_ header, or in _authorization_ header
  - No token error: `{ status: 'error', response: { message: 'No token provided.'}}`
  - Invalid token error: `{ status: 'error', response: { message: 'Invalid token.'}}`

## Auth Routes

- `/login`
  - Parameters: `username, password`
  - Success: `{ username, uid, access_token, expires_in }`
  - Error: `{ messages: ["ERROR_MESSAGE"], codes: ["ERROR_CODE"] }`
  - Exception: `{ message: "ERROR_MESSAGE", code: "ERROR_CODE", trace: "STACK_TRACE" }`
- `/signup`
  - Parameters: `username, password, secret_key`
    - _username_ and _password_ must have at least 8 characters and _password_ must have at least 1 number and 1 special character.
    - _secret_key_ is the secret key you set up with the CLI
  - **This endpoint is self-protecting, after ONE user is added JWT will be required**
  - Success: `{ username, uid, access_token, expires_in }`
  - Error: `{ messages: ["ERROR_MESSAGE"], codes: ["ERROR_CODE"] }`
  - Exception: `{ message: "ERROR_MESSAGE", code: "ERROR_CODE", trace: "STACK_TRACE" }`
- `/update_secret_key`
  - Parameters: `key`
    - _key_ must have at least 8 characters, 1 number, and 1 special character
  - **This endpoint is self-protecting, after ONE user is added JWT will be required**
  - Success:
    - `{attributes...}` - first insert
    - `{ n, nModified, ok }` - update after first insert
  - Error: `{ messages: ["ERROR_MESSAGE"], codes: ["ERROR_CODE"] }`
  - Exception: `{ message: "ERROR_MESSAGE", code: "ERROR_CODE", trace: "STACK_TRACE" }`
- `/update_password`
  - **JWT Required**
  - Parameters: `username, current_password, password`
    - _password_ must have at least 8 characters and must have at least 1 number.
  - Success: `{ status: 'ok', response: { message: 'Password updated.'} }`
  - Error: `{ messages: ["ERROR_MESSAGE"], codes: ["ERROR_CODE"] }`
  - Exception: `{ message: "ERROR_MESSAGE", code: "ERROR_CODE", trace: "STACK_TRACE" }`
- `/verify_token`
  - **JWT Required**
  - Parameters: `auth_token`
  - Success: `{ status: 'ok', response: { message: 'Token verified.'}`
  - Error: `{ status: 'error', response: { message: 'No token provided.'}}`

## CRUD Routes

- "x" denotes collection name
  - I.E. _/customer/insert?name=...?_
- `x/insert`
  - Inserts record
  - Success: `{attributes...}`
  - Error: `{ name: "MongoError", code: 1050 }`
- `x/update, x/push, x/push_unique, x/set`
  - `x/update` updates record
    - use field _update_primary_ to change the primary key
  - `x/push` pushes comma separated records into list
    - Records will be placed regardless if there is an existing matching record in the list
  - `x/push_unique` pushes unique comma separated records into the list
    - Only records that do not exist already will be placed in the list
    - This **WILL NOT** delete existing duplicate records
  - `x/set` sets list to comma separated records
  - Primary key required
  - Success: `{ n, nModified, ok }`
- `x/delete, x/delete_all`
  - Deletes single record or all records, primary key required for _delete_
  - Success: `{ n, deletedCount, ok }`
- `x/get`
  - Gets single record
  - Parameters: requires model primary key, i.e. `/user/get?username=bob`
  - Success: `[{attributes...}]`
- `x/get_all`
  - Gets all records
  - Params
    - _sort_field_
      - Field to sort by
    - _sort_order_
      - Sort order, -1 for descending, 1 for ascending
    - _record_limit_
      - Number of records to return
    - _skip_
      - Number of records to skip
  - Success: `[{attributes...}, {}...]`
- `x/find`
  - finds records
    - param - _where_
      - expects list of objects with attributes _field_, _op_, and _value_
        - i.e. [{ field: 'price', op: '$gt', value: 2 }]
      - operators
        - \$eq - equal
        - \$ne - not equal
        - \$gt - greater than
        - \$gte - greater than or equal to
        - \$lt - less than
        - \$lte - less than or equal to
        - \$in - in array
        - \$nin - not in array
        - \$strt - starts with string
        - \$end - ends with string
        - \$cont - contains string
        - \$inc - array field includes value
        - \$ninc - array field does not include value
    - param - _sort_field_
      - Field to sort by
    - param - _sort_order_
      - Sort order, -1 for descending, 1 for ascending
    - param - _record_limit_
      - Number of records to return
  - joins collections
    - param - _from_
      - collection to join
    - param - _local_field_
      - field from local collection to join
    - param - _foreign_field_
      - field from foreign collection to join
    - param - _as_
      - name to assign the joined field in returned document
    - if local field is a list, joined field will return a list
    - if local field is not a list, joined field will return an object
- `x/schema`
  - Gets schema information
  - Success: `{ schema: [], primary_key, list_fields: [], encrypt_fields: [], encode_fields: [], subdoc_fields: [] }`
- `x/sterilize`
  - Removes obsolete fields and indexes after updating schema
  - Sets value for given field for all documents (useful for updating old documents after adding schema)
  - Parameters: _field_name_ corresponds to collection field name

## Change Log

- v2.0.0
  - Codebase converted from Coffeescript -> Typescript

## Documentation

- [Package Docs](docs/globals.md)
