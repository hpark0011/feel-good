export const PROFILE_TAB_KINDS = ["posts", "articles", "clone-settings"] as const;
export type ProfileTabKind = (typeof PROFILE_TAB_KINDS)[number];
export const PROFILE_TAB_LABELS: Record<ProfileTabKind, string> = {
  posts: "Posts",
  articles: "Articles",
  "clone-settings": "Clone",
};
export function isProfileTabKind(value: string | null | undefined): value is ProfileTabKind {
  return value === "posts" || value === "articles" || value === "clone-settings";
}
export function getProfileTabHref(username: string, kind: ProfileTabKind): string {
  return `/@${username}/${kind}`;
}
