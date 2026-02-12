import type { Article } from "../lib/mock-articles";
import type { DatePreset } from "./date-preset";
import { getDateRange } from "./date-preset";

export type ArticleFilterState = {
  categories: string[];
  publishedDatePreset: DatePreset | null;
  createdDatePreset: DatePreset | null;
  publishedStatus: "draft" | "published" | null;
};

export const INITIAL_FILTER_STATE: ArticleFilterState = {
  categories: [],
  publishedDatePreset: null,
  createdDatePreset: null,
  publishedStatus: null,
};

export function filterArticles(
  articles: Article[],
  filter: ArticleFilterState,
  isOwner: boolean
): Article[] {
  return articles.filter((article) => {
    // Category filter (AND logic with others)
    if (filter.categories.length > 0) {
      if (!filter.categories.includes(article.category)) {
        return false;
      }
    }

    // Published date filter (AND logic with others)
    if (filter.publishedDatePreset !== null) {
      const dateRange = getDateRange(filter.publishedDatePreset);
      const publishedDate = new Date(article.published_at);

      if (publishedDate < dateRange.start || publishedDate > dateRange.end) {
        return false;
      }
    }

    // Created date filter (only applies if isOwner and filter is active)
    if (isOwner && filter.createdDatePreset !== null) {
      const dateRange = getDateRange(filter.createdDatePreset);
      const createdDate = new Date(article.created_at);

      if (createdDate < dateRange.start || createdDate > dateRange.end) {
        return false;
      }
    }

    // Published status filter (only applies if isOwner and filter is active)
    if (isOwner && filter.publishedStatus !== null) {
      if (article.status !== filter.publishedStatus) {
        return false;
      }
    }

    return true;
  });
}

export function getUniqueCategories(
  articles: Article[]
): { name: string; count: number }[] {
  if (articles.length === 0) {
    return [];
  }

  const categoryMap = new Map<string, number>();

  articles.forEach((article) => {
    const currentCount = categoryMap.get(article.category) || 0;
    categoryMap.set(article.category, currentCount + 1);
  });

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
