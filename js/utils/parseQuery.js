//: Parse Query
var parseQuery;

parseQuery = function(model, query) {
  var allFields, allOps, clause, error, expr, i, incOps, len, match, mongoOps, regOps;
  mongoOps = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in'];
  regOps = ['$strt', '$end', '$cont'];
  incOps = ['$nin', '$inc', '$ninc'];
  allOps = [...mongoOps, ...regOps, ...incOps];
  match = {
    $match: {
      $and: []
    }
  };
  try {
    query = JSON.parse(query);
    allFields = Object.keys(model.schema.paths);
    for (i = 0, len = query.length; i < len; i++) {
      clause = query[i];
      if (!allFields.includes(clause.field) || !allOps.includes(clause.op)) {
        continue;
      }
      if (mongoOps.includes(clause.op)) {
        expr = {
          $expr: {
            [clause.op]: [`$${clause.field}`, clause.value]
          }
        };
      } else if (regOps.includes(clause.op)) {
        expr = {
          [clause.field]: {
            $options: 'i'
          }
        };
        if (clause.op === '$strt') {
          expr[clause.field].$regex = `^${clause.value}`;
        } else if (clause.op === '$end') {
          expr[clause.field].$regex = `${clause.value}$`;
        } else if (clause.op === '$cont') {
          expr[clause.field].$regex = clause.value;
        }
      } else if (incOps.includes(clause.op)) {
        if (clause.op === '$inc') {
          expr = {
            [clause.field]: {
              $elemMatch: {
                $eq: clause.value
              }
            }
          };
        } else if (clause.op === '$ninc') {
          expr = {
            [clause.field]: {
              $not: {
                $elemMatch: {
                  $eq: clause.value
                }
              }
            }
          };
        } else if (clause.op === '$nin') {
          expr = {
            [clause.field]: {
              $nin: clause.value
            }
          };
        }
      }
      match.$match.$and.push(expr);
    }
    if (match.$match.$and.length === 0) {
      match = {
        $match: {}
      };
    }
  } catch (error1) {
    error = error1;
    match = {};
  }
  return match;
};

//: Exports
module.exports = parseQuery;
