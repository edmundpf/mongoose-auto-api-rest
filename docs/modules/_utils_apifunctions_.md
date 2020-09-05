[mongoose-auto-api.rest](../README.md) › [Globals](../globals.md) › ["utils/apiFunctions"](_utils_apifunctions_.md)

# Module: "utils/apiFunctions"

## Index

### Variables

* [AUTH_TOKEN](_utils_apifunctions_.md#const-auth_token)
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

### `Const` AUTH_TOKEN

• **AUTH_TOKEN**: *string* = uuid()

*Defined in [utils/apiFunctions.ts:8](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L8)*

___

### `Const` secretKey

• **secretKey**: *any* = models.secretKey.model

*Defined in [utils/apiFunctions.ts:7](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L7)*

___

### `Const` userAuth

• **userAuth**: *any* = models.userAuth.model

*Defined in [utils/apiFunctions.ts:6](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L6)*

## Functions

### `Const` allowedPassword

▸ **allowedPassword**(`req`: any): *true | object*

*Defined in [utils/apiFunctions.ts:114](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L114)*

**Parameters:**

Name | Type |
------ | ------ |
`req` | any |

**Returns:** *true | object*

___

### `Const` allowedSecretKey

▸ **allowedSecretKey**(`req`: any): *true | object*

*Defined in [utils/apiFunctions.ts:130](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L130)*

**Parameters:**

Name | Type |
------ | ------ |
`req` | any |

**Returns:** *true | object*

___

### `Const` errorObj

▸ **errorObj**(`error`: any): *object*

*Defined in [utils/apiFunctions.ts:24](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L24)*

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

*Defined in [utils/apiFunctions.ts:176](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L176)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |

**Returns:** *any*

___

### `Const` incorrectUserOrPass

▸ **incorrectUserOrPass**(`res`: any): *any*

*Defined in [utils/apiFunctions.ts:187](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L187)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |

**Returns:** *any*

___

### `Const` noCurrentPass

▸ **noCurrentPass**(`res`: any): *any*

*Defined in [utils/apiFunctions.ts:209](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L209)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |

**Returns:** *any*

___

### `Const` objOmit

▸ **objOmit**(`obj`: any, `keys`: Array‹string›): *any*

*Defined in [utils/apiFunctions.ts:14](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L14)*

**Parameters:**

Name | Type |
------ | ------ |
`obj` | any |
`keys` | Array‹string› |

**Returns:** *any*

___

### `Const` parseDataSort

▸ **parseDataSort**(`query`: any, `aggregate`: boolean): *any*

*Defined in [utils/apiFunctions.ts:32](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L32)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`query` | any | - |
`aggregate` | boolean | false |

**Returns:** *any*

___

### `Const` responseFormat

▸ **responseFormat**(`method`: any, `args`: any, `req`: any, `res`: any, `spreadArgs`: boolean): *Promise‹any›*

*Defined in [utils/apiFunctions.ts:146](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L146)*

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

*Defined in [utils/apiFunctions.ts:99](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L99)*

**Parameters:**

Name | Type |
------ | ------ |
`model` | any |

**Returns:** *Promise‹object›*

___

### `Const` schemaInfo

▸ **schemaInfo**(`model`: any): *object*

*Defined in [utils/apiFunctions.ts:88](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L88)*

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

▸ **signToken**(`user`: any): *object*

*Defined in [utils/apiFunctions.ts:222](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L222)*

**Parameters:**

Name | Type |
------ | ------ |
`user` | any |

**Returns:** *object*

* **access_token**: *any*

* **expires_in**: *number*

* **uid**: *any* = user.uid

* **username**: *any* = user.username

___

### `Const` updateQuery

▸ **updateQuery**(`req`: any, `primaryKey`: any): *any*

*Defined in [utils/apiFunctions.ts:103](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L103)*

**Parameters:**

Name | Type |
------ | ------ |
`req` | any |
`primaryKey` | any |

**Returns:** *any*

___

### `Const` userNotFound

▸ **userNotFound**(`res`: any): *any*

*Defined in [utils/apiFunctions.ts:198](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L198)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |

**Returns:** *any*

___

### `Const` verifyToken

▸ **verifyToken**(`req`: any, `res`: any, `next`: any): *Promise‹any›*

*Defined in [utils/apiFunctions.ts:242](https://github.com/edmundpf/mongoose-auto-api-rest/blob/3e697bb/src/utils/apiFunctions.ts#L242)*

**Parameters:**

Name | Type |
------ | ------ |
`req` | any |
`res` | any |
`next` | any |

**Returns:** *Promise‹any›*
