[mongoose-auto-api.rest](../README.md) › [Globals](../globals.md) › ["utils/jwtRotation"](_utils_jwtrotation_.md)

# Module: "utils/jwtRotation"

## Index

### Variables

* [store](_utils_jwtrotation_.md#const-store)

### Functions

* [getKeys](_utils_jwtrotation_.md#const-getkeys)
* [updateKeyData](_utils_jwtrotation_.md#const-updatekeydata)

## Variables

### `Const` store

• **store**: *Store‹›* = new Store({
	collection: 'mongoose_auto_api',
	name: 'jwt_k',
	defaultData: {
		cur: {
			k: '',
			exp: 0,
		},
		prev: {
			k: '',
			exp: 0,
		},
	},
})

*Defined in [utils/jwtRotation.ts:7](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/jwtRotation.ts#L7)*

## Functions

### `Const` getKeys

▸ **getKeys**(): *any*

*Defined in [utils/jwtRotation.ts:36](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/jwtRotation.ts#L36)*

**Returns:** *any*

___

### `Const` updateKeyData

▸ **updateKeyData**(`key`: string, `preservePrev`: boolean): *void*

*Defined in [utils/jwtRotation.ts:24](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e8a07e/src/utils/jwtRotation.ts#L24)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`key` | string | - |
`preservePrev` | boolean | false |

**Returns:** *void*
