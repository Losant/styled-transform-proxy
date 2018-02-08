import { __, curry, pipe, keys, reduce, is } from 'ramda';

import { proxyTemplateFunction, proxyTemplateFactory } from './utils';

const styledTransformProxy = curry((proxyFn, styled) => {
  const styledReducer = (acc, key) => {
    const originalValue = styled[key];

    if (is(Function, originalValue) && is(Function, originalValue.attrs)) {
      acc[key] = proxyTemplateFunction(proxyFn, originalValue);
    }

    return acc;
  };

  return pipe(
    proxyTemplateFactory(proxyFn), // styled(Component)
    reduce(styledReducer, __, keys(styled)), // styled.div, styled.span, etc.
  )(styled);
});

export default styledTransformProxy;
