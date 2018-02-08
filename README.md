# styled-transform-proxy

Helper function for extending styled-components via a custom transform function

## Example

```js
const transform = (val) => val.replace(/\.foo\s/g, '.bar ');
const styledCustom = styledTransformProxy(transform, styled);

// Results in `.foo` below being transformed to `.bar`
const MyComponent = styled.span`
  .foo {
    color: red;
  }
`;
```
