export const PATHS = {
  app: {
    dashboard: "/dashboard",
    tasks: "/dashboard/tasks",
    files: "/dashboard/files",
    settings: "/settings",
    profile: "/profile",
  },
  public: {
    home: "/",
    about: "/about",
    pricing: "/pricing",
  },
} as const;

export type PathKey = keyof typeof PATHS;
export type AppPathKey = keyof typeof PATHS.app;
export type PublicPathKey = keyof typeof PATHS.public;

export const getPath = <T extends PathKey>(
  section: T,
  path: keyof (typeof PATHS)[T]
) => PATHS[section][path];
