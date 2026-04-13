export const PROFILE_TAB_KINDS = ["posts", "articles", "clone-settings"] as const;
export type ProfileTabKind = (typeof PROFILE_TAB_KINDS)[number];
export const PROFILE_TAB_DEFAULT_KIND: ProfileTabKind = PROFILE_TAB_KINDS[0];
export const PROFILE_TAB_LABELS: Record<ProfileTabKind, string> = {
  posts: "Posts",
  articles: "Articles",
  "clone-settings": "Clone",
};
export function isProfileTabKind(value: string | null | undefined): value is ProfileTabKind {
  return typeof value === "string" && PROFILE_TAB_KINDS.includes(value as ProfileTabKind);
}
export function getProfileTabHref(username: string, kind: ProfileTabKind): string {
  return `/@${username}/${kind}`;
}
