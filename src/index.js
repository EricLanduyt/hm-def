
import $ from 'sanctuary-def';
import * as Sig from './signature';

function create({ checkTypes, env, typeClasses = [] }) {
  const $def = $.create({ checkTypes, env });

  function def(signature) {
    const params = Sig.resolve(typeClasses, env, signature);
    return $def(params.name)(params.constraints)(params.types);
  }

  return def;
}

export default {
  create,
};
