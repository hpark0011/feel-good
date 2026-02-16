export const isArticleDetailRoute = (path: string) =>
  /^\/@[^/]+\/.+/.test(path);
