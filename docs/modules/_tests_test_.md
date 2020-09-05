[mongoose-auto-api.rest](../README.md) › [Globals](../globals.md) › ["tests/test"](_tests_test_.md)

# Module: "tests/test"

## Index

### Variables

* [ACCESS_TOKEN](_tests_test_.md#let-access_token)
* [PASSWORD1](_tests_test_.md#const-password1)
* [PASSWORD2](_tests_test_.md#const-password2)
* [SECRET_KEY1](_tests_test_.md#const-secret_key1)
* [SECRET_KEY2](_tests_test_.md#const-secret_key2)
* [USERNAME](_tests_test_.md#const-username)
* [api](_tests_test_.md#let-api)
* [customerModel](_tests_test_.md#const-customermodel)
* [infoModel](_tests_test_.md#const-infomodel)
* [port](_tests_test_.md#let-port)
* [productModel](_tests_test_.md#const-productmodel)
* [subDocModel](_tests_test_.md#const-subdocmodel)
* [url](_tests_test_.md#let-url)

### Functions

* [createAssert](_tests_test_.md#const-createassert)
* [errorAssert](_tests_test_.md#const-errorassert)
* [errorCodeAssert](_tests_test_.md#const-errorcodeassert)
* [findTest](_tests_test_.md#const-findtest)
* [get](_tests_test_.md#const-get)
* [okayAssert](_tests_test_.md#const-okayassert)
* [okayExistsAssert](_tests_test_.md#const-okayexistsassert)
* [okayModAssert](_tests_test_.md#const-okaymodassert)
* [post](_tests_test_.md#const-post)
* [remove](_tests_test_.md#const-remove)
* [request](_tests_test_.md#const-request)

### Object literals

* [models](_tests_test_.md#const-models)

## Variables

### `Let` ACCESS_TOKEN

• **ACCESS_TOKEN**: *string* = ""

*Defined in [tests/test.ts:28](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L28)*

___

### `Const` PASSWORD1

• **PASSWORD1**: *"testPass1!"* = "testPass1!"

*Defined in [tests/test.ts:24](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L24)*

___

### `Const` PASSWORD2

• **PASSWORD2**: *"testPass2!"* = "testPass2!"

*Defined in [tests/test.ts:25](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L25)*

___

### `Const` SECRET_KEY1

• **SECRET_KEY1**: *"secretKeyTest1!"* = "secretKeyTest1!"

*Defined in [tests/test.ts:26](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L26)*

___

### `Const` SECRET_KEY2

• **SECRET_KEY2**: *"secretKeyTest2!"* = "secretKeyTest2!"

*Defined in [tests/test.ts:27](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L27)*

___

### `Const` USERNAME

• **USERNAME**: *"user@email.com"* = "user@email.com"

*Defined in [tests/test.ts:23](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L23)*

___

### `Let` api

• **api**: *any*

*Defined in [tests/test.ts:18](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L18)*

___

### `Const` customerModel

• **customerModel**: *"{
	name: 'customer',
	schema: {
		name: {
			type: String,
			unique: true,
			required: true,
			primaryKey: true,
		},
		email: {
			type: String,
			unique: true,
			required: true,
		},
		products: [{
			type: String
		}]
	},
}"* = `\
{
	name: 'customer',
	schema: {
		name: {
			type: String,
			unique: true,
			required: true,
			primaryKey: true,
		},
		email: {
			type: String,
			unique: true,
			required: true,
		},
		products: [{
			type: String
		}]
	},
}\
`

*Defined in [tests/test.ts:33](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L33)*

___

### `Const` infoModel

• **infoModel**: *"{
	name: 'info',
	schema: {
		email: {
			type: String,
			unique: true,
			required: true,
			primaryKey: true,
		},
		location: {
			type: String,
			unique: true,
			required: true,
		}
	},
}"* = `\
{
	name: 'info',
	schema: {
		email: {
			type: String,
			unique: true,
			required: true,
			primaryKey: true,
		},
		location: {
			type: String,
			unique: true,
			required: true,
		}
	},
}\
`

*Defined in [tests/test.ts:74](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L74)*

___

### `Let` port

• **port**: *any*

*Defined in [tests/test.ts:18](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L18)*

___

### `Const` productModel

• **productModel**: *"{
	name: 'product',
	schema: {
		name: {
			type: String,
			unique: true,
			required: true,
			primaryKey: true,
		},
		price: {
			type: Number,
			unique: true,
			required: true,
		}
	},
}"* = `\
{
	name: 'product',
	schema: {
		name: {
			type: String,
			unique: true,
			required: true,
			primaryKey: true,
		},
		price: {
			type: Number,
			unique: true,
			required: true,
		}
	},
}\
`

*Defined in [tests/test.ts:55](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L55)*

___

### `Const` subDocModel

• **subDocModel**: *"{
	name: 'subDoc',
	schema: {
		name: {
			type: new require('mongoose').Schema({
				address: String,
			}),
			required: true,
		},
		password: {
			type: String,
			encode: true,
		}
	},
}"* = `\
{
	name: 'subDoc',
	schema: {
		name: {
			type: new require('mongoose').Schema({
				address: String,
			}),
			required: true,
		},
		password: {
			type: String,
			encode: true,
		}
	},
}\
`

*Defined in [tests/test.ts:93](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L93)*

___

### `Let` url

• **url**: *any*

*Defined in [tests/test.ts:18](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L18)*

## Functions

### `Const` createAssert

▸ **createAssert**(`res`: any): *void*

*Defined in [tests/test.ts:279](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L279)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |

**Returns:** *void*

___

### `Const` errorAssert

▸ **errorAssert**(`res`: any, `msg`: any, `args?`: any): *void*

*Defined in [tests/test.ts:193](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L193)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |
`msg` | any |
`args?` | any |

**Returns:** *void*

___

### `Const` errorCodeAssert

▸ **errorCodeAssert**(`res`: any, `codes`: any): *void*

*Defined in [tests/test.ts:215](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L215)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |
`codes` | any |

**Returns:** *void*

___

### `Const` findTest

▸ **findTest**(`field`: any, `op`: any, `value`: any, `valField`: any, `valRes`: any): *Promise‹void›*

*Defined in [tests/test.ts:287](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L287)*

**Parameters:**

Name | Type |
------ | ------ |
`field` | any |
`op` | any |
`value` | any |
`valField` | any |
`valRes` | any |

**Returns:** *Promise‹void›*

___

### `Const` get

▸ **get**(`endpoint`: any, `log`: boolean): *Promise‹any›*

*Defined in [tests/test.ts:175](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L175)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`endpoint` | any | - |
`log` | boolean | true |

**Returns:** *Promise‹any›*

___

### `Const` okayAssert

▸ **okayAssert**(`res`: any, `msg`: any, `args?`: any): *void*

*Defined in [tests/test.ts:231](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L231)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |
`msg` | any |
`args?` | any |

**Returns:** *void*

___

### `Const` okayExistsAssert

▸ **okayExistsAssert**(`res`: any, `fields`: any): *void*

*Defined in [tests/test.ts:253](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L253)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |
`fields` | any |

**Returns:** *void*

___

### `Const` okayModAssert

▸ **okayModAssert**(`res`: any, `field`: any, `num`: any): *void*

*Defined in [tests/test.ts:269](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L269)*

**Parameters:**

Name | Type |
------ | ------ |
`res` | any |
`field` | any |
`num` | any |

**Returns:** *void*

___

### `Const` post

▸ **post**(`endpoint`: any, `log`: boolean): *Promise‹any›*

*Defined in [tests/test.ts:181](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L181)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`endpoint` | any | - |
`log` | boolean | true |

**Returns:** *Promise‹any›*

___

### `Const` remove

▸ **remove**(`endpoint`: any, `log`: boolean): *Promise‹any›*

*Defined in [tests/test.ts:187](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L187)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`endpoint` | any | - |
`log` | boolean | true |

**Returns:** *Promise‹any›*

___

### `Const` request

▸ **request**(`endpoint`: any, `func`: any, `log`: any): *Promise‹any›*

*Defined in [tests/test.ts:148](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L148)*

**Parameters:**

Name | Type |
------ | ------ |
`endpoint` | any |
`func` | any |
`log` | any |

**Returns:** *Promise‹any›*

## Object literals

### `Const` models

### ▪ **models**: *object*

*Defined in [tests/test.ts:111](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L111)*

###  ./models/customer.js

• **./models/customer.js**: *string* = customerModel

*Defined in [tests/test.ts:112](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L112)*

###  ./models/info.js

• **./models/info.js**: *string* = infoModel

*Defined in [tests/test.ts:114](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L114)*

###  ./models/product.js

• **./models/product.js**: *string* = productModel

*Defined in [tests/test.ts:113](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L113)*

###  ./models/subDoc.js

• **./models/subDoc.js**: *string* = subDocModel

*Defined in [tests/test.ts:115](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/tests/test.ts#L115)*
