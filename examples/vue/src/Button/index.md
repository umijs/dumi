# JSX Support

## Lightweight Demo + Composition API + JSX

```jsx
/**
 * title: jsx
 */
import { defineComponent } from 'vue';
import { Button } from '@examples/vue';

export default defineComponent({
  setup() {
    function handleClick() {
      alert('Using defineComponent API');
    }
    return () => <Button onClick={handleClick}>Click me</Button>;
  },
});
```

## Lightweight Inline Demo + Options API + JSX

```jsx | inline
import { Button } from '@examples/vue';

export default {
  data() {
    return {
      msg: 'Using Options API',
    };
  },
  methods: {
    handleClick() {
      alert(this.msg);
    },
  },
  render() {
    return <Button onClick={this.handleClick}>Click me</Button>;
  },
};
```

## External Demo + TSX

<code src="./demos/Demo.tsx"></code>

## Functional Component

```tsx
import { Article } from '@examples/vue';
function ArticleWrapper() {
  return <Article></Article>;
}

export default ArticleWrapper;
```

## Button API

### Props

<API id="Button" type="props"></API>

### Slots

<API id="Button" type="slots"></API>

### Events

<API id="Button" type="events"></API>

### Methods

<API id="Button" type="imperative"></API>

## Article API

## Props

<API id="Article" type="props"></API>

## Events

<API id="Article" type="events"></API>

## Slots

<API id="Article" type="slots"></API>

## List API

:::warning
The List component is defined in the form of `defineComponent(<T>function() {})`, so only Props and Events can be obtained
:::

### Props

<API id="List" type="props"></API>

### Events

<API id="List" type="events"></API>
