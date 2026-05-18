"use client";

import { useRef, useState } from "react";

import {
  Avatar,
  BottomInfo,
  Button,
  Card,
  Heading,
  Paragraph,
  Text,
  TextField,
} from "@zaemoru/react";

import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notification-context";
import {
  useChangePassword,
  useDeleteAvatar,
  useUploadAvatar,
} from "@/lib/queries";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { addNotification } = useNotifications();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const changePassword = useChangePassword();
  const avatarLoading = uploadAvatar.isPending || deleteAvatar.isPending;
  const loading = changePassword.isPending;

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("jpg, png, webp 이미지만 업로드 가능합니다.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("파일 크기는 2MB 이하여야 합니다.");
      return;
    }

    setAvatarError(null);
    try {
      await uploadAvatar.mutateAsync(file);
      await refreshUser();
      addNotification("success", "프로필 사진이 변경되었습니다.");
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "업로드에 실패했습니다.",
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAvatarDelete = async () => {
    setAvatarError(null);
    try {
      await deleteAvatar.mutateAsync();
      await refreshUser();
      addNotification("info", "프로필 사진이 삭제되었습니다.");
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    if (
      newPassword.length < 8 ||
      !/[a-zA-Z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/~`]/.test(newPassword)
    ) {
      setError("비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      addNotification("info", "비밀번호가 변경되었습니다.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "비밀번호 변경에 실패했습니다.",
      );
    }
  };

  const initials = user?.email?.charAt(0).toUpperCase() || "?";
  const roleLabel =
    user?.role === "admin"
      ? "관리자"
      : user?.role === "project_owner"
        ? "프로젝트 오너"
        : "일반 사용자";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level="1" size="xl">
          설정
        </Heading>
        <Paragraph size="sm" tone="muted">
          계정 및 환경 설정을 관리합니다.
        </Paragraph>
      </div>

      <Card elevation="low" padding="medium">
        <Heading level="3" size="md">
          계정 정보
        </Heading>
        <Paragraph size="sm" tone="muted">
          현재 로그인한 계정의 기본 정보입니다.
        </Paragraph>

        <div className="mt-4 flex items-center gap-4">
          <Avatar
            className="shrink-0"
            size="large"
            src={user?.avatar_url ?? undefined}
            fallback={initials}
            alt="프로필 사진"
          />
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="small"
                disabled={avatarLoading}
                loading={avatarLoading}
                onClick={() => fileInputRef.current?.click()}
              >
                사진 변경
              </Button>
              {user?.avatar_url && (
                <Button
                  variant="danger"
                  size="small"
                  disabled={avatarLoading}
                  onClick={handleAvatarDelete}
                >
                  삭제
                </Button>
              )}
            </div>
            <Text size="xs" tone="muted">
              JPG, PNG, WebP (최대 2MB)
            </Text>
            {avatarError && (
              <Text size="xs" tone="danger">
                {avatarError}
              </Text>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <Text size="xs" tone="muted">
              이메일
            </Text>
            <Text size="sm" weight="medium">
              {user?.email || "-"}
            </Text>
          </div>
          <div>
            <Text size="xs" tone="muted">
              역할
            </Text>
            <Text size="sm" weight="medium">
              {roleLabel}
            </Text>
          </div>
        </div>
      </Card>

      <Card elevation="low" padding="medium">
        <Heading level="3" size="md">
          비밀번호 변경
        </Heading>
        <Paragraph size="sm" tone="muted">
          계정 비밀번호를 변경합니다.
        </Paragraph>

        <div className="mt-4 flex max-w-md flex-col gap-3">
          <TextField
            label="현재 비밀번호"
            type="password"
            value={currentPassword}
            placeholder="현재 비밀번호 입력"
            onChange={(value) => setCurrentPassword(value)}
          />
          <TextField
            label="새 비밀번호"
            type="password"
            value={newPassword}
            placeholder="8자 이상, 영문+숫자+특수문자"
            onChange={(value) => setNewPassword(value)}
          />
          <TextField
            label="새 비밀번호 확인"
            type="password"
            value={confirmPassword}
            placeholder="새 비밀번호 다시 입력"
            onChange={(value) => setConfirmPassword(value)}
          />

          {error && <BottomInfo tone="danger">{error}</BottomInfo>}
          {success && (
            <BottomInfo tone="primary">비밀번호가 변경되었습니다.</BottomInfo>
          )}

          <Button
            variant="primary"
            loading={loading}
            disabled={loading}
            onClick={handleChangePassword}
          >
            비밀번호 변경
          </Button>
        </div>
      </Card>
    </div>
  );
}
