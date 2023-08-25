export const compose = (...funcs: ((...args: any[]) => any)[]) =>
  funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args)),
    (arg) => arg,
  );
