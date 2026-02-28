import type { Profile } from "../types";

export const MOCK_PROFILE: Profile = {
  _id: "mock_user_id" as Profile["_id"],
  authId: "mock_auth_id",
  username: "rick-rubin",
  avatarUrl: null,
  name: "Rick Rubin",
  bio: "Rick Rubin has been a singular, transformative creative muse for artists across genres and generations — from the Beastie Boys to Johnny Cash, from Public Enemy to the Red Hot Chili Peppers, from Adele to Jay-Z.",
  media: {
    video: "/portrait-video.mp4",
    poster: "/rr.webp",
  },
};
