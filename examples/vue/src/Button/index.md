# JSX Support

## Lightweight Demo + Composition API + JSX

```jsx
/**
 * title: jsx
 */
import { defineComponent } from 'vue';
import { Button } from '@exmaples/vue';

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
import { Button } from '@exmaples/vue';

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
interface ArticleProps {
  title?: string;
  desc?: string;
}

function Article(props: ArticleProps) {
  return (
    <article>
      <h1>{props.title}</h1>
      <p>{props.desc}</p>
    </article>
  );
}

Article.props = {
  title: {
    type: String,
    required: false,
    default: 'Functional Component Demo',
  },
  desc: {
    type: String,
    required: false,
    default: 'No Desc here',
  },
};

export default Article;
```

## The API table is not supported yet

<API id="Button"></API>
