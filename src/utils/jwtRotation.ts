import Store from 'json-config-ts'
import { default as uuid } from 'uuidv4'
import { TOKEN_EXPIRY } from './apiFunctions'

// Init

const store = new Store({
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

// Update Key Data

const updateKeyData = (key: string, preservePrev = false) => {
	if (key == 'cur' && preservePrev) {
		store.set('prev', store.data.cur)
	}
	store.set(key, {
		k: uuid(),
		exp: Math.round(new Date().getTime() / 1000) + TOKEN_EXPIRY,
	})
}

// Get Keys

export const getKeys = () => {
	const curTime = new Date().getTime() / 1000
	store.load()
	for (const key in store.data) {
		if (!store.data[key].k) {
			updateKeyData(key, false)
		} else if (key == 'cur' && curTime > store.data[key].exp) {
			updateKeyData(key, true)
		}
	}
	return store.data
}
