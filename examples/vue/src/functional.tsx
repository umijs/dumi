import { FunctionalComponent as FC } from 'vue';
export interface ArticleProps {
  /**
   * 文章标题
   * @beta
   * @default "Functional Component Demo"
   */
  title?: string;
  /**
   * 文章描述
   * @since 0.0.1
   * @default "No Desc here"
   */
  desc?: string;

  /**
   * 点击事件
   * @since 0.0.1
   */
  onClick?: (e: Event) => void;
}

export interface ArticleSlots {
  default?: any;
}

const Article: FC<ArticleProps, {}, ArticleSlots> = function (
  props,
  { slots },
) {
  return (
    <article onClick={props.onClick}>
      <h1>{props.title}</h1>
      <p>{props.desc}</p>
      {slots.default && <p>{slots.default()}</p>}
    </article>
  );
};

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
