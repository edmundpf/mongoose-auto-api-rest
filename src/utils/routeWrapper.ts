import models from 'mongoose-auto-api.models';

//: Route Methods

const listMethods = [
	'set',
	'push',
	'push_unique'
];

const normalMethods = [
	'insert',
	'update',
	'delete',
	'delete_all',
	'get',
	'get_all',
	'find',
	'sterilize',
	'schema'
];

const routeMethods = [
	// ...normalMethods,
	// ...listMethods
];

//: Get Routes

const getRoutes = function() {
	const listRoutes = {};
	const normalRoutes = {};
	for (let key in models) {
		const model = models[key];
		if (model.listFields.length > 0) {
			listRoutes[model.collectionName] = model;
		} else {
			normalRoutes[model.collectionName] = model;
		}
	}
	return{
		list: listRoutes,
		normal: normalRoutes
	};
};

//: Routes

const routes = getRoutes();
const listRoutes = routes.list;
const normalRoutes = routes.normal;
const appRoutes = {
	// ...listRoutes,
	// ...normalRoutes
};

//: Exports

export default {
	listRoutes,
	normalRoutes,
	appRoutes,
	listMethods,
	normalMethods,
	routeMethods,
};

//::: End Program :::