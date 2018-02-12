import { __, curry, pipe, keys, reduce, is } from 'ramda';

import { makeProxiedTemplateFunction, makeProxiedTemplateFactory } from './utils';

const styledTransformProxy = curry((transformFn, styled) => {
  const styledReducer = (acc, key) => {
    const originalValue = styled[key];

    if (is(Function, originalValue) && is(Function, originalValue.attrs)) {
      acc[key] = makeProxiedTemplateFunction(transformFn, originalValue);
    }

    return acc;
  };

  return pipe(
    makeProxiedTemplateFactory(transformFn), // styled(Component)
    reduce(styledReducer, __, keys(styled)), // styled.div, styled.span, etc.
  )(styled);
});

export default styledTransformProxy;
