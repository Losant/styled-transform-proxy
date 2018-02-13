// @flow

import { __, curry, pipe, keys, reduce, is } from 'ramda';

import {
  hasTemplateFactoryMethods,
  makeProxiedTemplateFunction,
  makeProxiedTemplateFactory,
} from './utils';

const styledTransformProxy = curry(
  (transformFn: (...*) => *, styled: *) => {
    const styledReducer = (acc: Function, key: string) => {
      const sourceValue = styled[key];

      if (is(Function, sourceValue) && hasTemplateFactoryMethods(sourceValue)) {
        acc[key] = makeProxiedTemplateFunction(transformFn, sourceValue);
      }

      return acc;
    };

    return pipe(
      makeProxiedTemplateFactory(transformFn), // styled(Component)
      reduce(styledReducer, __, keys(styled)), // styled.div, styled.span, etc.
    )(styled);
  }
);

export default styledTransformProxy;
