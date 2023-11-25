type CustomEventName = `dots:${string}`;

const dispatch = (
  name: CustomEventName,
  detail: any,
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

  document.dispatchEvent(new CustomEvent('dots:fresh:EntryType', options));
};

const listen = (name: CustomEventName, handler: EventListener): void => {
  document.addEventListener(name, handler);
};

const unlisten = (name: CustomEventName, handler: EventListener): void => {
  document.removeEventListener(name, handler);
};

export { dispatch, listen, unlisten };
