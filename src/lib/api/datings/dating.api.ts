const API_URL = process.env.NEXT_PUBLIC_BE_URL || "http://localhost:5001";

export interface LastMessage {
  _id: string;
  room_id: string;
  sender_id: string;
  receiver_id: string;
  content?: string;
  image_url?: string;
  type: "text" | "both" | "image";
  is_read: boolean;
  is_recalled: boolean;
  timestamp: string;
}

export interface CurrentMatch {
  match_id: string;
  room_id: string;
  last_message?: LastMessage | null;
  partner: { _id: string; full_name: string; status: "online" | "offline" };
  status: "pending" | "accepted";
  expires_at : Date;
  my_accept: boolean;
  partner_accept: boolean;
  both_accepted?: boolean;
}

export interface LikeUserResponse {
  match: boolean;
  match_id?: string;
  room_id?: string;
}

export interface AcceptRejectResponse {
  success: boolean;
  bothAccept?: boolean;
}

const getAuthToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export const getDatingCandidates = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("Vui lòng đăng nhập");

  const res = await fetch(`${API_URL}/datings/candidates`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi server");
  return data;
};

export const likeUser = async (targetId: string): Promise<LikeUserResponse> => {
  const token = getAuthToken();
  if (!token) throw new Error("Vui lòng đăng nhập");

  const res = await fetch(`${API_URL}/datings/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi server");
  return data;
};

export const unlike = async (targetId: string) => {
  const token = getAuthToken();
  if (!token) throw new Error("Vui lòng đăng nhập");

  try {
    const res = await fetch(`${API_URL}/datings/unlike`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId }),
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export const getCurrentMatchChat = async (): Promise<CurrentMatch | null> => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/datings/match-chat`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data.data ;
  } catch {
    return null;
  }
};

export const acceptMatch = async (): Promise<AcceptRejectResponse | null> => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/datings/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export const rejectMatch = async (): Promise<AcceptRejectResponse | null> => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/datings/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export const cancelDating = async (): Promise<AcceptRejectResponse | null> => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/datings/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};
