
type Replacer = (obj: object, key: string, path: string[]) => any;

export const recursiveProxyMap = <Entry extends object>(obj: Entry, replacer: Replacer, path: string[] = []): any => {
  return new Proxy(obj, {
    get(target, prop: Extract<keyof Entry, string>, receiver) {
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop, receiver);
      }

      const nextPath = path.concat(prop)
      const replaced = replacer(target, prop, nextPath);
      if (Array.isArray(replaced)) {
        return replaced;
      }

      if (replaced === target[prop]) {
        // if replcaed is the same as the original value,
        // then no need to apply recursive proxy
        return target[prop];
      }

      if (replaced) {
        return recursiveProxyMap(replaced, replacer, nextPath);
      }

      if (typeof target[prop] === "object") {
        return recursiveProxyMap(target[prop], replacer, nextPath);
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}