
import $ from 'sanctuary-def';
import * as Sig from './signature';

function create({ checkTypes, env, typeClasses = [] }) {
  const $def = $.create({ checkTypes, env });

  function def(signature) {
    return function def$inner(func) {
      const params = Sig.resolve(typeClasses, env, signature);
      return $def(params.name)(params.constraints)(params.types)(func);
    };
  }

  return def;
}

export default {
  create,
};
