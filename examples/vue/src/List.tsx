import {
  SetupContext,
  defineComponent,
  onMounted,
  ref,
  shallowRef,
  type SlotsType,
} from 'vue';

export type BaseItem = { id: string | number; text: string };

export interface ListProps<Item extends BaseItem> {
  /**
   * data source
   */
  source: () => Promise<Array<Item>> | Array<Item>;
  /**
   * trigger when data have been loaded
   * @deprecated
   */
  onLoaded?: (data: Array<Item>) => void;
}

export interface ListSlotsType<Item extends BaseItem> {
  item?: { item: Item };
}

/**
 * @component
 * Generic components must use `@component`, because defineComponent returns just a plain function
 */
export const List = defineComponent(function <Item extends BaseItem = BaseItem>(
  { source, onLoaded }: ListProps<Item>,
  { slots, expose }: SetupContext<{}, SlotsType<ListSlotsType<Item>>>,
) {
  const list = shallowRef<Array<Item>>([]);
  const loading = ref(false);

  async function load() {
    loading.value = true;
    const data = await source();
    list.value = data;
    loading.value = false;
    onLoaded?.(data);
  }

  expose({
    // 遗憾的是这种函数定义方式，解析器并不能抽取imperative数据
    load,
  });

  onMounted(async () => {
    load();
  });
  return () => (
    <>
      {loading.value ? (
        'loading...'
      ) : (
        <ul>
          {list.value.map((item) => (
            <li key={item.id}>
              {slots.item ? slots.item({ item }) : item.text}
            </li>
          ))}
        </ul>
      )}
    </>
  );
});
