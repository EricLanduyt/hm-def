
import R from 'ramda';
import $ from 'sanctuary-def';

/*
From https://www.npmjs.com/package/hindley-milner-parser-js:

HMP.parse('hello :: Foo a => a -> String');
{
  name: 'hello',
  constraints: [
    {typeclass: 'Foo', typevar: 'a'}],
  type:
    {type: 'function', text: '', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'typeConstructor', text: 'String', children: []}]};
*/

// type TypeMap = StrMap Type

export const constraints = sig => ({});

// :: {s: a} -> s -> a
const lookup = R.flip(R.prop);

const uncurry2 = R.uncurryN(2);
const recurry2 = R.compose(R.curry, uncurry2);

// :: Object -> String -> Boolean
const typeEq = R.propEq('type')

// :: SignatureEntry -> Boolean
const hasChildren = R.compose(R.not, R.isEmpty, R.prop('children'));

// :: TypeMap -> SignatureEntry -> Type
const lookupType = typeMap => entry => {
  const name = entry.text;
  const t = lookup(typeMap, name);
  if (!t) {
    const allTypes = R.keys(typeMap).join(', ');
    throw new TypeError(`Type ${name} not found in env. Available types are: ${allTypes}`);
  }
  return t;
};

// :: TypeMap -> SignatureEntry -> Type
const convertTypeConstructor = typeMap => entry => R.ifElse(
  hasChildren,
  R.compose(
    R.apply(lookupType(typeMap)(entry)),
    convertTypes(typeMap),
    R.prop('children')
  ),
  lookupType(typeMap)
)(entry);

// :: TypeMap -> SignatureEntry -> Type
const convertList = R.useWith(
  R.compose($.Array, uncurry2(convertType)), [
    R.identity,
    R.path(['children', 0])
  ]
);

// :: TypeMap -> SignatureEntry -> Type
const convertFunction = R.useWith(
  R.compose($.Function, uncurry2(convertTypes)), [
    R.identity,
    R.prop(['children'])
  ]
);

// :: SignatureEntry -> Type
const convertTypevar = R.memoize(R.compose($.TypeVariable, R.prop('text')));

// :: TypeMap -> SignatureEntry -> Type
function convertType(typeMap) {
  return R.cond([
    [R.propEq('type', 'typeConstructor'), convertTypeConstructor(typeMap)],
    [R.propEq('type', 'function'), convertFunction(typeMap)],
    [R.propEq('type', 'list'), convertList(typeMap)],
    [R.propEq('type', 'typevar'), convertTypevar],
  ]);
}

// :: TypeMap -> [SignatureEntry] -> [Type]
function convertTypes(typeMap) {
  return R.map(convertType(typeMap));
}

// :: TypeMap -> ParsedSignature -> [Type]
export const types = recurry2(convertTypes);

// :: String -> String
const stripNamespace = R.compose(R.last, R.split('/'));

// :: Type -> String
const shortName = R.compose(
  stripNamespace,
  R.prop('name'),
  ensureParametrized
);

// Type -> Type
// stolen from sanctuary-def implementation
function ensureParametrized(x) {
  return typeof x === 'function' ?
    x.apply(null, R.map(R.always($.Unknown), R.range(0, x.length))) :
    x;
}

// :: [Type] -> TypeMap
export const typemap = R.indexBy(shortName);
