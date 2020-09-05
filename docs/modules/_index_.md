[mongoose-auto-api.rest](../README.md) › [Globals](../globals.md) › ["index"](_index_.md)

# Module: "index"

## Index

### Variables

* [app](_index_.md#const-app)
* [config](_index_.md#const-config)
* [corsPort](_index_.md#const-corsport)
* [databaseName](_index_.md#databasename)
* [mongoosePort](_index_.md#mongooseport)
* [secretKey](_index_.md#const-secretkey)
* [serverAddress](_index_.md#let-serveraddress)
* [serverPort](_index_.md#const-serverport)
* [userAuth](_index_.md#const-userauth)

### Functions

* [init](_index_.md#const-init)
* [mongooseConnect](_index_.md#const-mongooseconnect)
* [serverStarted](_index_.md#const-serverstarted)
* [start](_index_.md#const-start)
* [startServer](_index_.md#const-startserver)

## Variables

### `Const` app

• **app**: *any* = express()

*Defined in [index.ts:52](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L52)*

___

### `Const` config

• **config**: *any* = existsSync(join(__dirname, '../../../appConfig.json'))
	? require('../../../appConfig.json')
	: require('./data/defaultConfig.json')

*Defined in [index.ts:36](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L36)*

___

### `Const` corsPort

• **corsPort**: *any* = process.env.NODE_ENV === 'production'
		? process.env.WEB_PORT || config.webPort
		: config.webPort + 10

*Defined in [index.ts:43](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L43)*

___

###  databaseName

• **databaseName**: *any*

*Defined in [index.ts:48](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L48)*

___

###  mongoosePort

• **mongoosePort**: *any*

*Defined in [index.ts:47](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L47)*

___

### `Const` secretKey

• **secretKey**: *any* = models.secretKey.model

*Defined in [index.ts:50](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L50)*

___

### `Let` serverAddress

• **serverAddress**: *any* = null

*Defined in [index.ts:51](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L51)*

___

### `Const` serverPort

• **serverPort**: *any* = process.env.NODE_ENV === 'production'
		? process.env.PORT || config.serverPort
		: config.serverPort + 10

*Defined in [index.ts:39](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L39)*

___

### `Const` userAuth

• **userAuth**: *any* = models.userAuth.model

*Defined in [index.ts:49](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L49)*

## Functions

### `Const` init

▸ **init**(): *Promise‹any›*

*Defined in [index.ts:86](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L86)*

**Returns:** *Promise‹any›*

___

### `Const` mongooseConnect

▸ **mongooseConnect**(): *Promise‹any›*

*Defined in [index.ts:57](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L57)*

**Returns:** *Promise‹any›*

___

### `Const` serverStarted

▸ **serverStarted**(): *any*

*Defined in [index.ts:76](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L76)*

**Returns:** *any*

___

### `Const` start

▸ **start**(): *Promise‹void›*

*Defined in [index.ts:620](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L620)*

**Returns:** *Promise‹void›*

___

### `Const` startServer

▸ **startServer**(): *void*

*Defined in [index.ts:103](https://github.com/edmundpf/mongoose-auto-api-rest/blob/7dbbc32/src/index.ts#L103)*

**Returns:** *void*
