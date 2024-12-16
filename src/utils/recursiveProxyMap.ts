type Replacer = (obj: object, key: string, path: string[]) => any;

export const recursiveProxyMap = <Entry extends object>(
  obj: Entry,
  replacer: Replacer,
  path: string[] = [],
): any => {
  return new Proxy(obj, {
    get(target, prop: Extract<keyof Entry, string>, receiver) {
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop, receiver);
      }

      const nextPath = path.concat(prop);
      const replaced = replacer(target, prop, nextPath);
      if (Array.isArray(replaced)) {
        return replaced;
      }

      // @ts-ignore
      const value = target[prop];
      if (replaced === value) {
        // if replcaed is the same as the original value,
        // then no need to apply recursive proxy
        return value;
      }

      if (replaced) {
        return recursiveProxyMap(replaced, replacer, nextPath);
      }

      if (typeof value === "object") {
        // @ts-ignore
        return recursiveProxyMap(value, replacer, nextPath);
      }

      return Reflect.get(target, prop, receiver);
    },
  });
};
