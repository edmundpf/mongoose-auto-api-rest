models = require('mongoose-auto-api.models')

#: Route Methods

listMethods = [
	'set'
	'push'
	'push_unique'
]

normalMethods = [
	'insert'
	'update'
	'delete'
	'delete_all'
	'get'
	'get_all'
	'sterilize'
	'schema'
]

routeMethods = [
	...normalMethods,
	...listMethods
]

#: Get Routes

getRoutes = () ->
	listRoutes = {}
	normalRoutes = {}
	for key, model of models
		if model.listFields.length > 0
			listRoutes[model.collectionName] = model
		else
			normalRoutes[model.collectionName] = model
	return
		list: listRoutes
		normal: normalRoutes

#: Routes

routes = getRoutes()
listRoutes = routes.list
normalRoutes = routes.normal
appRoutes = {...listRoutes, ...normalRoutes}

#: Exports

module.exports = {
	listRoutes,
	normalRoutes,
	appRoutes,
	listMethods,
	normalMethods,
	routeMethods,
}

#::: End Program :::