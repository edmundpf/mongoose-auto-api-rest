/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//: Parse Query

const parseQuery = function(model, query) {
	const mongoOps = [
		'$eq',
		'$ne',
		'$gt',
		'$gte',
		'$lt',
		'$lte',
		'$in'
	];
	const regOps = [
		'$strt',
		'$end',
		'$cont'
	];
	const incOps = [
		'$nin',
		'$inc',
		'$ninc'
	];
	const allOps = [
		// ...mongoOps,
		// ...regOps,
		// ...incOps,
	];
	let match = {
		$match: {
			$and: []
		}
	};
	try {
		query = JSON.parse(query);
		const allFields = Object.keys(model.schema.paths);
		for (let clause of Array.from(query)) {
			var expr;
			if (!allFields.includes(clause.field) || !allOps.includes(clause.op)) {
				continue;
			}
			if (mongoOps.includes(clause.op)) {
				expr = {
					$expr:
						// [clause.op]:
						[
							`$${clause.field}`,
							clause.value
						]
				};
			} else if (regOps.includes(clause.op)) {
				expr =
					// [clause.field]:
					{ $options: 'i' };
				if (clause.op === '$strt') {
					expr[clause.field].$regex = `^${clause.value}`;
				} else if (clause.op === '$end') {
					expr[clause.field].$regex = `${clause.value}$`;
				} else if (clause.op === '$cont') {
					expr[clause.field].$regex = clause.value;
				}
			} else if (incOps.includes(clause.op)) {
				if (clause.op === '$inc') {
					expr =
						// [clause.field]:
						{
							$elemMatch: {
								$eq: clause.value
							}
						};
				} else if (clause.op === '$ninc') {
					expr =
						// [clause.field]:
						{
							$not: {
								$elemMatch: {
									$eq: clause.value
								}
							}
						};
				} else if (clause.op === '$nin') {
					expr =
						// [clause.field]:
						{
							$nin: clause.value
						};
				}
			}
			match.$match.$and.push(expr);
		}
		if (match.$match.$and.length === 0) {
			match =
				{$match: {}};
		}
	} catch (error) {
		match = {};
	}
	return match;
};

//: Exports

export default parseQuery;