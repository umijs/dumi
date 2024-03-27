import { PropType, SlotsType, defineComponent, ref, shallowRef } from 'vue';
import { FooSlotsType, JSXComponent, fooProps } from '../props';

const Foo = defineComponent({
  name: 'Foo',
  props: {
    ...fooProps,
    /**
     * click event
     */
    onClick: Function as PropType<(e: MouseEvent, extra?: string) => void>,
  },
  slots: Object as SlotsType<FooSlotsType>,
  emits: {
    click(e: MouseEvent, extra?: string) {
      return !!e.target && !!extra;
    },
    change(payload?: { name: string }) {
      return !!payload.name;
    },
  },
  expose: ['focus', 'count'],
  setup(props, { expose, emit, slots }) {
    const rootRef = shallowRef<HTMLElement | null>(null);
    const publicCount = ref(0);
    const focus = () => {
      rootRef.value?.focus();
    };
    expose({
      focus,
      count: publicCount,
    });

    function handleClick(e: MouseEvent) {
      emit('click', e, 'extra');
    }
    function handleChange() {
      emit('change', {
        name: 'change',
      });
    }
    return () => (
      <div ref={rootRef} onClick={handleClick} onChange={handleChange}>
        {props.a}
        {slots?.icon}
        {slots?.item({ list: [], extra: true })}
      </div>
    );
  },
});

export default Foo as JSXComponent<
  typeof Foo,
  {
    /**
     * The signature of the expose api should be obtained from here
     * @alpha
     */
    focus: () => void;
    /**
     * @deprecated will be released in 0.0.1
     */
    count: number;
  }
>;
