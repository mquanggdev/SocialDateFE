export interface User {
  _id: string
  full_name: string
  email: string
  avatar_url?: string
}

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

export const getListRecomendation = async (): Promise<User[]> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.")
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/friends/list-recomendation`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message)
    }

    return data.listPerson || []
  } catch (err) {
    throw err instanceof Error ? err : new Error("Lỗi không xác định khi tải danh sách.")
  }
}

export const getFriendsList = async (): Promise<User[]> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.")
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/friends/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message)
    }

    return data.listPerson || []
  } catch (err) {
    throw err instanceof Error ? err : new Error("Lỗi không xác định khi tải danh sách bạn bè.")
  }
}

export const getFriendRequests = async (): Promise<User[]> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.")
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/friends/requests`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message)
    }

    return data.listPerson || []
  } catch (err) {
    throw err instanceof Error ? err : new Error("Lỗi không xác định khi tải lời mời kết bạn.")
  }
}

export const getSentRequests = async (): Promise<User[]> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.")
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/friends/sent-requests`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message)
    }

    return data.listPerson || []
  } catch (err) {
    throw err instanceof Error ? err : new Error("Lỗi không xác định khi tải yêu cầu đã gửi.")
  }
}

