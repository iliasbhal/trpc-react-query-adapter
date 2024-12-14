export const mergeWithNotify = (obj: any, mergeObject: any, callback?: any) => {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      if (mergeObject[prop]) {
        callback?.(prop);
        if (typeof mergeObject[prop] == "function") {
          return mergeObject[prop].bind(mergeObject);
        }

        return mergeObject[prop];
      }

      if (typeof target[prop] == "function") {
        return target[prop].bind(target);
      }

      return target[prop];
    },
    ownKeys(target) {
      return [...Reflect.ownKeys(mergeObject), ...Reflect.ownKeys(target)];
    },
    getOwnPropertyDescriptor(target, key) {
      if (mergeObject[key]) {
        return {
          get value() {
            return mergeObject[key];
          },
          enumerable: true,
          configurable: true,
        };
      }

      return {
        get value() {
          return target[key];
        },
        enumerable: true,
        configurable: true,
      };
    },
  });
};
