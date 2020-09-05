[mongoose-auto-api.rest](../README.md) › [Globals](../globals.md) › ["utils/apiFunctions"](_utils_apifunctions_.md)

# Module: "utils/apiFunctions"

## Index

### Variables

* [ONE_DAY](_utils_apifunctions_.md#const-one_day)
* [ONE_HOUR](_utils_apifunctions_.md#const-one_hour)
* [TOKEN_EXPIRY](_utils_apifunctions_.md#const-token_expiry)
* [secretKey](_utils_apifunctions_.md#const-secretkey)
* [userAuth](_utils_apifunctions_.md#const-userauth)

### Functions

* [allowedPassword](_utils_apifunctions_.md#const-allowedpassword)
* [allowedSecretKey](_utils_apifunctions_.md#const-allowedsecretkey)
* [errorObj](_utils_apifunctions_.md#const-errorobj)
* [incorrectSecretKey](_utils_apifunctions_.md#const-incorrectsecretkey)
* [incorrectUserOrPass](_utils_apifunctions_.md#const-incorrectuserorpass)
* [noCurrentPass](_utils_apifunctions_.md#const-nocurrentpass)
* [objOmit](_utils_apifunctions_.md#const-objomit)
* [parseDataSort](_utils_apifunctions_.md#const-parsedatasort)
* [responseFormat](_utils_apifunctions_.md#const-responseformat)
* [schemaAsync](_utils_apifunctions_.md#const-schemaasync)
* [schemaInfo](_utils_apifunctions_.md#const-schemainfo)
* [signToken](_utils_apifunctions_.md#const-signtoken)
* [updateQuery](_utils_apifunctions_.md#const-updatequery)
* [userNotFound](_utils_apifunctions_.md#const-usernotfound)
* [verifyToken](_utils_apifunctions_.md#const-verifytoken)

## Variables

### `Const` ONE_DAY

• **ONE_DAY**: *number* = 24 * ONE_HOUR

*Defined in [utils/apiFunctions.ts:8](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L8)*

___

### `Const` ONE_HOUR

• **ONE_HOUR**: *number* = 60 * 60

*Defined in [utils/apiFunctions.ts:7](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L7)*

___

### `Const` TOKEN_EXPIRY

• **TOKEN_EXPIRY**: *number* = 7 * ONE_DAY

*Defined in [utils/apiFunctions.ts:9](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L9)*

___

### `Const` secretKey

• **secretKey**: *any* = models.secretKey.model

*Defined in [utils/apiFunctions.ts:6](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L6)*

___

### `Const` userAuth

• **userAuth**: *any* = models.userAuth.model

*Defined in [utils/apiFunctions.ts:5](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L5)*

## Functions

### `Const` allowedPassword

▸ **allowedPassword**(`req`: any): *true | object*

*Defined in [utils/apiFunctions.ts:115](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L115)*

**Parameters:**

Name | Type |
------ | ------ |
`req` | any |

**Returns:** *true | object*

___

### `Const` allowedSecretKey

▸ **allowedSecretKey**(`req`: any): *true | object*

*Defined in [utils/apiFunctions.ts:131](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L131)*

**Parameters:**

Name | Type |
------ | ------ |
`req` | any |

**Returns:** *true | object*

___

### `Const` errorObj

▸ **errorObj**(`error`: any): *object*

*Defined in [utils/apiFunctions.ts:25](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L25)*

**Parameters:**

Name | Type |
------ | ------ |
`error` | any |

**Returns:** *object*

* **message**: *any* = error.message

* **name**: *any* = error.name

* **trace**: *any* = error.stack.split('\n')[1].trim()

___

### `Const` incorrectSecretKey

▸ **incorrectSecretKey**(`res`: any): *any*

*Defined in [utils/apiFunctions.ts:177](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L177)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |

**Returns:** *any*

___

### `Const` incorrectUserOrPass

▸ **incorrectUserOrPass**(`res`: any): *any*

*Defined in [utils/apiFunctions.ts:188](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L188)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |

**Returns:** *any*

___

### `Const` noCurrentPass

▸ **noCurrentPass**(`res`: any): *any*

*Defined in [utils/apiFunctions.ts:210](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L210)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |

**Returns:** *any*

___

### `Const` objOmit

▸ **objOmit**(`obj`: any, `keys`: Array‹string›): *any*

*Defined in [utils/apiFunctions.ts:15](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L15)*

**Parameters:**

Name | Type |
------ | ------ |
`obj` | any |
`keys` | Array‹string› |

**Returns:** *any*

___

### `Const` parseDataSort

▸ **parseDataSort**(`query`: any, `aggregate`: boolean): *any*

*Defined in [utils/apiFunctions.ts:33](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L33)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`query` | any | - |
`aggregate` | boolean | false |

**Returns:** *any*

___

### `Const` responseFormat

▸ **responseFormat**(`method`: any, `args`: any, `req`: any, `res`: any, `spreadArgs`: boolean): *Promise‹any›*

*Defined in [utils/apiFunctions.ts:147](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L147)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`method` | any | - |
`args` | any | - |
`req` | any | - |
`res` | any | - |
`spreadArgs` | boolean | true |

**Returns:** *Promise‹any›*

___

### `Const` schemaAsync

▸ **schemaAsync**(`model`: any): *Promise‹object›*

*Defined in [utils/apiFunctions.ts:100](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L100)*

**Parameters:**

Name | Type |
------ | ------ |
`model` | any |

**Returns:** *Promise‹object›*

___

### `Const` schemaInfo

▸ **schemaInfo**(`model`: any): *object*

*Defined in [utils/apiFunctions.ts:89](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L89)*

**Parameters:**

Name | Type |
------ | ------ |
`model` | any |

**Returns:** *object*

* **encode_fields**: *any* = model.encodeFields

* **encrypt_fields**: *any* = model.encryptFields

* **list_fields**: *any* = model.listFields

* **primary_key**: *any* = model.primaryKey

* **schema**: *string[]* = Object.keys(model.model.schema.paths)

* **subdoc_fields**: *any* = model.subDocFields

___

### `Const` signToken

▸ **signToken**(`user`: any, `curToken`: any): *object*

*Defined in [utils/apiFunctions.ts:223](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L223)*

**Parameters:**

Name | Type |
------ | ------ |
`user` | any |
`curToken` | any |

**Returns:** *object*

* **access_token**: *any*

* **expires_in**: *number* = TOKEN_EXPIRY

* **uid**: *any* = user.uid

* **username**: *any* = user.username

___

### `Const` updateQuery

▸ **updateQuery**(`req`: any, `primaryKey`: any): *any*

*Defined in [utils/apiFunctions.ts:104](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L104)*

**Parameters:**

Name | Type |
------ | ------ |
`req` | any |
`primaryKey` | any |

**Returns:** *any*

___

### `Const` userNotFound

▸ **userNotFound**(`res`: any): *any*

*Defined in [utils/apiFunctions.ts:199](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L199)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |

**Returns:** *any*

___

### `Const` verifyToken

▸ **verifyToken**(`req`: any, `res`: any, `next`: any): *Promise‹any›*

*Defined in [utils/apiFunctions.ts:247](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/apiFunctions.ts#L247)*

**Parameters:**

Name | Type |
------ | ------ |
`req` | any |
`res` | any |
`next` | any |

**Returns:** *Promise‹any›*
