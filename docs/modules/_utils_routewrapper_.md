[mongoose-auto-api.rest](../README.md) › [Globals](../globals.md) › ["utils/routeWrapper"](_utils_routewrapper_.md)

# Module: "utils/routeWrapper"

## Index

### Variables

* [listMethods](_utils_routewrapper_.md#const-listmethods)
* [listRoutes](_utils_routewrapper_.md#const-listroutes)
* [normalMethods](_utils_routewrapper_.md#const-normalmethods)
* [normalRoutes](_utils_routewrapper_.md#const-normalroutes)
* [routeMethods](_utils_routewrapper_.md#const-routemethods)
* [routes](_utils_routewrapper_.md#const-routes)

### Functions

* [getRoutes](_utils_routewrapper_.md#const-getroutes)

### Object literals

* [appRoutes](_utils_routewrapper_.md#const-approutes)

## Variables

### `Const` listMethods

• **listMethods**: *string[]* = ['set', 'push', 'push_unique']

*Defined in [utils/routeWrapper.ts:5](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e67b45/src/utils/routeWrapper.ts#L5)*

___

### `Const` listRoutes

• **listRoutes**: *object* = routes.list

*Defined in [utils/routeWrapper.ts:43](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e67b45/src/utils/routeWrapper.ts#L43)*

#### Type declaration:

___

### `Const` normalMethods

• **normalMethods**: *string[]* = [
	'insert',
	'update',
	'delete',
	'delete_all',
	'get',
	'get_all',
	'find',
	'sterilize',
	'schema',
]

*Defined in [utils/routeWrapper.ts:7](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e67b45/src/utils/routeWrapper.ts#L7)*

___

### `Const` normalRoutes

• **normalRoutes**: *object* = routes.normal

*Defined in [utils/routeWrapper.ts:44](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e67b45/src/utils/routeWrapper.ts#L44)*

#### Type declaration:

___

### `Const` routeMethods

• **routeMethods**: *string[]* = [...normalMethods, ...listMethods]

*Defined in [utils/routeWrapper.ts:19](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e67b45/src/utils/routeWrapper.ts#L19)*

___

### `Const` routes

• **routes**: *object* = getRoutes()

*Defined in [utils/routeWrapper.ts:42](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e67b45/src/utils/routeWrapper.ts#L42)*

#### Type declaration:

* **list**(): *object*

* **normal**(): *object*

## Functions

### `Const` getRoutes

▸ **getRoutes**(): *object*

*Defined in [utils/routeWrapper.ts:23](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e67b45/src/utils/routeWrapper.ts#L23)*

**Returns:** *object*

* **list**(): *object*

* **normal**(): *object*

## Object literals

### `Const` appRoutes

### ▪ **appRoutes**: *object*

*Defined in [utils/routeWrapper.ts:45](https://github.com/edmundpf/mongoose-auto-api-rest/blob/1e67b45/src/utils/routeWrapper.ts#L45)*
