import { Button } from '@examples/vue';
import { defineComponent, ref } from 'vue';
import './demo.less';

export default defineComponent({
  setup() {
    const count = ref(0);
    const handleClick = (e: Event) => {
      count.value++;
    };
    return () => (
      <div class="demo">
        <Button onClick={handleClick} icon="👹">
          count {count.value}
        </Button>
      </div>
    );
  },
});
