"use client";

import { useEffect, useState } from "react";
import { Edit, Save, X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { editProfile } from "@/lib/api/profile/editProfile.api";
import { getProfile } from "@/lib/api/profile/getProfile.api";
import Swal from "sweetalert2";
import { useAuth } from "@/contexts/authContext";

// Helper function to format date safely
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "Không xác định";
  const date = new Date(dateStr);
  return isNaN(date.getTime())
    ? "Ngày không hợp lệ"
    : date.toLocaleDateString("vi-VN");
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const user = await getProfile();
        if (user) {
          // Normalize match_preferences
          user.match_preferences = {
            gender: user.match_preferences?.gender ?? "other",
            age_range: user.match_preferences?.age_range ?? {
              min: 18,
              max: 50,
            },
            distance_km: user.match_preferences?.distance_km ?? 50,
            interests: user.match_preferences?.interests ?? [],
            location_preference:
              user.match_preferences?.location_preference ?? "",
          };
          setUser(user);
          setOriginalUser(user);
        } else {
          setError("Không tìm thấy thông tin hồ sơ.");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Lỗi khi tải hồ sơ.";
        setError(errorMessage);
        console.error("Lỗi khi tải hồ sơ:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Handle changes to direct User fields
  const handleChange = <K extends keyof User>(field: K, value: User[K]) => {
    if (user) {
      setUser((prev) => (prev ? { ...prev, [field]: value } : prev));
    }
  };

  // Handle changes to match_preferences fields
  const handlePreferenceChange = <K extends keyof User["match_preferences"]>(
    field: K,
    value: User["match_preferences"][K]
  ) => {
    if (user) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              match_preferences: { ...prev.match_preferences, [field]: value },
            }
          : prev
      );
    }
  };

  // Handle avatar upload
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ (jpg, png, ...).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("Kích thước file ảnh không được vượt quá 5MB.");
      return;
    }

    // Preview image
    const previewUrl = URL.createObjectURL(file);
    setUser((prev) =>
      prev ? { ...prev, avatar_url: previewUrl, _avatarFile: file } : prev
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Basic validation
    if (
      !user.full_name ||
      !user.birthday ||
      !user.address ||
      !user.phone ||
      !user.gender
    ) {
      setError(
        "Vui lòng điền đầy đủ các trường bắt buộc: Họ tên, Ngày sinh, Địa chỉ, Số điện thoại, Giới tính."
      );
      return;
    }
    if (!/^\d{10,11}$/.test(user.phone)) {
      setError("Số điện thoại phải có 10-11 chữ số.");
      return;
    }
    if (
      !user.match_preferences.age_range?.min ||
      !user.match_preferences.age_range?.max
    ) {
      setError("Vui lòng nhập đầy đủ khoảng tuổi mong muốn.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      // Create FormData for submission
      const formData = new FormData();
      formData.append(
        "user",
        JSON.stringify({
          full_name: user.full_name,
          birthday: user.birthday,
          address: user.address,
          phone: user.phone,
          bio: user.bio,
          interests: user.interests,
          gender: user.gender,
          location: user.location,
          match_preferences: {
            gender: user.match_preferences.gender,
            age_range: user.match_preferences.age_range,
            distance_km: user.match_preferences.distance_km,
            interests: user.match_preferences.interests || [],
            location_preference: user.match_preferences.location_preference,
          },
        })
      );

      if (user._avatarFile) {
        formData.append("avatar_url", user._avatarFile);
        console.log("Avatar file:", user.avatar_url); // Log để debug
      }

      const updatedUser = await editProfile(formData);
      // Normalize match_preferences in response
      updatedUser.match_preferences = {
        gender: updatedUser.match_preferences?.gender ?? "other",
        age_range: updatedUser.match_preferences?.age_range ?? {
          min: 18,
          max: 50,
        },
        distance_km: updatedUser.match_preferences?.distance_km ?? 50,
        interests: updatedUser.match_preferences?.interests ?? [],
        location_preference:
          updatedUser.match_preferences?.location_preference ?? "",
      };
      setUser(updatedUser);
      setOriginalUser(updatedUser);
      await Swal.fire({
        icon: "success",
        title: "Cập nhật thành công!",
        text: "Hồ sơ của bạn đã được lưu lại.",
        confirmButtonColor: "#10b981",
      });
      setIsEditing(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    setUser(originalUser);
    setIsEditing(false);
    setError("");
  };

  const allInterests = [
    "Du lịch",
    "Âm nhạc",
    "Thể thao",
    "Đọc sách",
    "Công nghệ",
    "Phim ảnh",
    "Nấu ăn",
    "Thời trang",
    "Game",
    "Nghệ thuật",
  ];

  // Display loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải hồ sơ...</p>
      </div>
    );
  }

  // Display error if present
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push("/profile")}
          className="mt-4 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
        >
          Tải Lại
        </button>
      </div>
    );
  }

  // If no user, display message
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-600">Không tìm thấy thông tin hồ sơ.</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="mt-4 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
        >
          Đăng nhập lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h2>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
              >
                <Edit size={16} /> Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                >
                  <Save size={16} /> {isSubmitting ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  <X size={16} /> Hủy
                </button>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="text-center mt-6">
            <div className="relative w-28 h-28 mx-auto">
              <img
                src={user.avatar_url || "default-avatar.jpg"}
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-pink-300"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full text-white hover:bg-pink-600 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadAvatar}
                    className="hidden"
                  />
                  <Upload size={16} />
                </label>
              )}
            </div>
            <h3 className="text-xl font-semibold mt-3">{user.full_name}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Thông tin cá nhân
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Họ tên */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Họ và tên
              </label>
              {isEditing ? (
                <input
                  value={user.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              ) : (
                <p>{user.full_name}</p>
              )}
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Giới tính
              </label>
              {isEditing ? (
                <select
                  value={user.gender}
                  onChange={(e) =>
                    handleChange(
                      "gender",
                      e.target.value as "male" | "female" | "other"
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              ) : (
                <p>
                  {user.gender === "male"
                    ? "Nam"
                    : user.gender === "female"
                    ? "Nữ"
                    : "Khác"}
                </p>
              )}
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Ngày sinh
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={user.birthday}
                  onChange={(e) => handleChange("birthday", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              ) : (
                <p>{formatDate(user.birthday)}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Số điện thoại
              </label>
              {isEditing ? (
                <input
                  value={user.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              ) : (
                <p>{user.phone}</p>
              )}
            </div>

            {/* Địa chỉ */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">
                Địa chỉ
              </label>
              {isEditing ? (
                <input
                  value={user.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              ) : (
                <p>{user.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Giới thiệu bản thân
          </h3>
          {isEditing ? (
            <textarea
              value={user.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              rows={4}
            />
          ) : (
            <p className="text-gray-700">{user.bio || "Chưa có giới thiệu"}</p>
          )}
        </div>

        {/* Interests */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sở thích</h3>
          {isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allInterests.map((interest) => (
                <label key={interest} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={user.interests.includes(interest)}
                    onChange={(e) =>
                      handleChange(
                        "interests",
                        e.target.checked
                          ? [...user.interests, interest]
                          : user.interests.filter((i) => i !== interest)
                      )
                    }
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.interests.length > 0 ? (
                user.interests.map((i) => (
                  <span
                    key={i}
                    className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
                  >
                    {i}
                  </span>
                ))
              ) : (
                <p>Chưa chọn sở thích</p>
              )}
            </div>
          )}
        </div>

        {/* Match Preferences */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Tiêu chí ghép đôi mong muốn
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Giới tính mong muốn */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Giới tính mong muốn
              </label>
              {isEditing ? (
                <select
                  value={user.match_preferences.gender}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "gender",
                      e.target.value as "male" | "female" | "other"
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Bất kỳ</option>
                </select>
              ) : (
                <p>
                  {user.match_preferences.gender === "male"
                    ? "Nam"
                    : user.match_preferences.gender === "female"
                    ? "Nữ"
                    : "Bất kỳ"}
                </p>
              )}
            </div>

            {/* Khoảng cách */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Khoảng cách tối đa (km)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={user.match_preferences.distance_km}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "distance_km",
                      Number(e.target.value) || 1
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  min="1"
                />
              ) : (
                <p>{user.match_preferences.distance_km} km</p>
              )}
            </div>

            {/* Độ tuổi */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Độ tuổi mong muốn
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={user.match_preferences.age_range.min}
                    onChange={(e) =>
                      handlePreferenceChange("age_range", {
                        min: Number(e.target.value) || 18,
                        max: user.match_preferences.age_range.max,
                      })
                    }
                    className="w-1/2 border rounded-lg px-3 py-2"
                    min="18"
                  />
                  <input
                    type="number"
                    value={user.match_preferences.age_range.max}
                    onChange={(e) =>
                      handlePreferenceChange("age_range", {
                        min: user.match_preferences.age_range.min,
                        max: Number(e.target.value) || 50,
                      })
                    }
                    className="w-1/2 border rounded-lg px-3 py-2"
                    max="100"
                  />
                </div>
              ) : (
                <p>
                  {user.match_preferences.age_range.min} -{" "}
                  {user.match_preferences.age_range.max} tuổi
                </p>
              )}
            </div>

            {/* Vị trí ưu tiên */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Vị trí ưu tiên
              </label>
              {isEditing ? (
                <input
                  value={user.match_preferences.location_preference}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "location_preference",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ví dụ: Hà Nội"
                />
              ) : (
                <p>
                  {user.match_preferences.location_preference ||
                    "Không xác định"}
                </p>
              )}
            </div>
          </div>

          {/* Sở thích đối tượng */}
          <div className="mt-4">
            <label className="block text-sm text-gray-700 mb-2">
              Sở thích của đối tượng mong muốn
            </label>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {allInterests.map((interest) => (
                  <label key={interest} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={user.match_preferences.interests.includes(
                        interest
                      )}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "interests",
                          e.target.checked
                            ? [...user.match_preferences.interests, interest]
                            : user.match_preferences.interests.filter(
                                (i) => i !== interest
                              )
                        )
                      }
                    />
                    <span>{interest}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {user.match_preferences.interests.length > 0 ? (
                  user.match_preferences.interests.map((i) => (
                    <span
                      key={i}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                    >
                      {i}
                    </span>
                  ))
                ) : (
                  <p>Chưa chọn sở thích</p>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
