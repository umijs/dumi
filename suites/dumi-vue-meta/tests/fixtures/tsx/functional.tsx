import type { FunctionalComponent as FC, SetupContext, SlotsType } from 'vue';

type FComponentProps = {
  message: string;
};

type FComponentEvents = {
  sendMessage: (message: string) => void;
};

type FSlots = {
  default?: any;
};

export const AnonymousFComponent: FC<
  FComponentProps,
  FComponentEvents,
  FSlots
> = (props, { emit, slots }) => {
  return (
    <button onClick={() => emit('sendMessage', props.message)}>
      {slots.default ? slots.default() : props.message}
    </button>
  );
};

AnonymousFComponent.displayName = 'FComponent';

AnonymousFComponent.props = {
  message: {
    type: String,
    required: true,
  },
};

AnonymousFComponent.emits = {
  sendMessage: (value) => typeof value === 'string',
};

export function NamedFComponent(
  props: FComponentProps,
  { emit, slots }: SetupContext<FComponentEvents, SlotsType<FSlots>>,
) {
  return (
    <button onClick={() => emit('sendMessage', props.message)}>
      {slots.default ? slots.default() : props.message}
    </button>
  );
}

NamedFComponent.displayName = 'NamedComponent';
