import { Accessor, onCleanup } from 'solid-js';

type CustomEventName = `dots:${string}`;

const dispatch = (
  name: CustomEventName,
  detail: any,
  source: HTMLElement | Document = document.body,
  opts?: CustomEventInit,
): void => {
  const options = opts
    ? {
        bubbles: true,
        ...opts,
        detail,
      }
    : {
        bubbles: true,
        detail,
      };

  source.dispatchEvent(new CustomEvent(name, options));
};

const listen = (
  name: CustomEventName,
  handler: EventListener,
  source?: HTMLElement | Document,
): void => {
  (source ?? document.body).addEventListener(name, handler);
};

const unlisten = (
  name: CustomEventName,
  handler: EventListener,
  source?: HTMLElement | Document,
): void => {
  (source ?? document.body).removeEventListener(name, handler);
};

type CustomEventAccessor = Accessor<
  [name: CustomEventName, handler: EventListener, doc?: boolean]
>;

const customEvent = (el: HTMLElement, accessor: CustomEventAccessor): void => {
  const [name, handler, doc] = accessor();
  listen(name, handler, doc ? document.body : el);
  onCleanup(() => unlisten(name, handler, doc ? document.body : el));
};

declare module 'solid-js' {
  namespace JSX {
    interface CustomEvents {
      refetchItem: CustomEvent;
    }
  }
}

export type { CustomEventAccessor };
export { dispatch, listen, unlisten, customEvent };
