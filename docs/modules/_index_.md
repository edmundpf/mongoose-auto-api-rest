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

*Defined in [index.ts:50](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L50)*

___

### `Const` config

• **config**: *any* = fs.existsSync('../../../appConfig.json')
	? require('../../../appConfig.json')
	: require('./data/defaultConfig.json')

*Defined in [index.ts:34](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L34)*

___

### `Const` corsPort

• **corsPort**: *any* = process.env.NODE_ENV === 'production'
		? process.env.WEB_PORT || config.webPort
		: config.webPort + 10

*Defined in [index.ts:41](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L41)*

___

###  databaseName

• **databaseName**: *any*

*Defined in [index.ts:46](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L46)*

___

###  mongoosePort

• **mongoosePort**: *any*

*Defined in [index.ts:45](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L45)*

___

### `Const` secretKey

• **secretKey**: *any* = models.secretKey.model

*Defined in [index.ts:48](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L48)*

___

### `Let` serverAddress

• **serverAddress**: *any* = null

*Defined in [index.ts:49](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L49)*

___

### `Const` serverPort

• **serverPort**: *any* = process.env.NODE_ENV === 'production'
		? process.env.PORT || config.serverPort
		: config.serverPort + 10

*Defined in [index.ts:37](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L37)*

___

### `Const` userAuth

• **userAuth**: *any* = models.userAuth.model

*Defined in [index.ts:47](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L47)*

## Functions

### `Const` init

▸ **init**(): *Promise‹any›*

*Defined in [index.ts:83](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L83)*

**Returns:** *Promise‹any›*

___

### `Const` mongooseConnect

▸ **mongooseConnect**(): *Promise‹any›*

*Defined in [index.ts:54](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L54)*

**Returns:** *Promise‹any›*

___

### `Const` serverStarted

▸ **serverStarted**(): *any*

*Defined in [index.ts:73](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L73)*

**Returns:** *any*

___

### `Const` start

▸ **start**(): *Promise‹any›*

*Defined in [index.ts:619](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L619)*

**Returns:** *Promise‹any›*

___

### `Const` startServer

▸ **startServer**(): *any*

*Defined in [index.ts:94](https://github.com/edmundpf/mongoose-auto-api-rest/blob/8bc98fa/src/index.ts#L94)*

**Returns:** *any*
