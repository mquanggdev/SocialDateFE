// types/user.ts
export interface User {
  _id: string;
  email: string;
  full_name: string;
  password?: string;
  avatar_url: string;
  _avatarFile?: File;
  birthday: string;
  bio: string;
  address: string;
  phone: string;
  gender: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  interests: string[];
  match_preferences: {
    gender?: "male" | "female" | "other";
    age_range?: { min: number; max: number };
    distance_km?: number;
    interests?: string[];
    location_preference?: string;
  };
  friends: string[];
  request_to_friend: string[];
  request_to_me: string[];
  current_match: string | null;
  ready_to_match: {
    is_ready: boolean;
    requested_at: string | null;
    max_wait_time: number;
  };
  is_dating: boolean;
  dating_partner: string;
  pending_like_target?: string;
  status: "online" | "offline" | "busy";
  socketId?: string;
  last_active: string;
  created_at: string;
  updated_at: string;
}
