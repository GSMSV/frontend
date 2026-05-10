"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Badge,
  BottomInfo,
  Button,
  ListRow,
  Link as ZmLink,
  ProgressStepper,
  Tag,
  TextArea,
  TextField,
} from "@zaemoru/react";

import {
  ApiError,
  checkProjectEligibility,
  type ProjectCheckResponse,
  type ProjectInfo,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  PasswordStrength,
  isPasswordValid,
} from "@/components/auth/password-strength";

type Step = "email" | "details";

export default function ProjectSignupPage() {
  const { signupProject } = useAuth();

  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [studentName, setStudentName] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reason, setReason] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const [error, setError] = useState("");

  const handleCheckEmail = async () => {
    if (checkLoading) return;
    setError("");
    setCheckLoading(true);
    try {
      const data: ProjectCheckResponse = await checkProjectEligibility(email);
      setProjects(data.projects);
      setStudentName(data.student.name || "");
      const available = data.projects.filter((p) => !p.taken);
      if (available.length > 0) setSelectedProject(available[0].name);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "프로젝트 조회 중 오류가 발생했습니다.",
      );
    } finally {
      setCheckLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (submitLoading) return;
    setError("");
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!isPasswordValid(password)) {
      setError("비밀번호 조건을 모두 충족해주세요.");
      return;
    }
    if (!reason.trim()) {
      setError("신청 사유를 입력해주세요.");
      return;
    }
    setSubmitLoading(true);
    try {
      await signupProject(email, password, selectedProject, reason);
      sessionStorage.setItem("notif:signup", "true");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "회원가입 중 오류가 발생했습니다.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const availableProjects = projects.filter((p) => !p.taken);

  return (
    <AuthShell
      title={step === "email" ? "프로젝트 확인" : "계정 설정"}
      description={
        step === "email" ? (
          <>
            <Tag>Project</Tag>{" "}
            DataGSM에서 조회되는 프로젝트 참여자만 가입할 수 있습니다.
          </>
        ) : (
          <>{selectedProject} 프로젝트 오너로 가입합니다.</>
        )
      }
    >
      <ProgressStepper value={step === "email" ? 1 : 2} total={2} />

      {error && <BottomInfo tone="danger">{error}</BottomInfo>}

      {step === "email" && (
        <div className="flex flex-col gap-4">
          <div
            className="flex flex-col gap-4"
            onKeyDown={(e) => {
              if (e.key === "Enter" && projects.length === 0) handleCheckEmail();
            }}
          >
            <TextField
              label="이메일"
              type="email"
              value={email}
              placeholder="your@gsm.hs.kr"
              autoComplete="email"
              size="large"
              onChange={(value) => {
                setEmail(value);
                setProjects([]);
                setSelectedProject("");
              }}
            />
            {projects.length === 0 && (
              <Button
                variant="primary"
                size="large"
                fullWidth
                loading={checkLoading}
                disabled={checkLoading || !email}
                onClick={handleCheckEmail}
              >
                프로젝트 조회
              </Button>
            )}
          </div>

          {projects.length > 0 && (
            <div className="flex flex-col gap-3">
              {studentName && (
                <BottomInfo tone="default">
                  <strong>{studentName}</strong>님의 참여 프로젝트
                </BottomInfo>
              )}

              <div className="flex flex-col gap-2">
                {projects.map((project) => (
                  <ListRow
                    key={project.name}
                    interactive={!project.taken}
                    title={project.name}
                    description={
                      project.taken
                        ? "오너 등록됨"
                        : project.club ?? undefined
                    }
                    trailing={
                      selectedProject === project.name && !project.taken
                        ? "✓"
                        : undefined
                    }
                    onClick={() => {
                      if (project.taken) return;
                      setSelectedProject(project.name);
                      setError("");
                    }}
                  />
                ))}
              </div>

              {availableProjects.length === 0 ? (
                <BottomInfo tone="warning">
                  선택 가능한 프로젝트가 없습니다.
                </BottomInfo>
              ) : (
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  disabled={!selectedProject}
                  onClick={() => {
                    if (!selectedProject) {
                      setError("프로젝트를 선택해주세요.");
                      return;
                    }
                    setError("");
                    setStep("details");
                  }}
                >
                  다음
                </Button>
              )}
            </div>
          )}

          <div className="flex flex-col items-center gap-2 text-sm">
            <span>
              일반 계정으로 가입하시겠어요?{" "}
              <Link href="/signup">
                <ZmLink>일반 회원가입</ZmLink>
              </Link>
            </span>
            <span>
              이미 계정이 있으신가요?{" "}
              <Link href="/login">
                <ZmLink>로그인</ZmLink>
              </Link>
            </span>
          </div>
        </div>
      )}

      {step === "details" && (
        <div className="flex flex-col gap-4">
          <BottomInfo tone="primary">
            <Badge variant="weak" color="blue" size="small">
              {selectedProject}
            </Badge>{" "}
            <span>{email}</span>
          </BottomInfo>

          <div
            className="flex flex-col gap-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          >
            <div className="flex flex-col gap-2">
              <TextField
                label="비밀번호"
                type="password"
                value={password}
                placeholder="비밀번호를 입력하세요"
                autoComplete="new-password"
                size="large"
                onChange={(value) => setPassword(value)}
              />
              <PasswordStrength password={password} />
            </div>
            <TextField
              label="비밀번호 확인"
              type="password"
              value={confirmPassword}
              placeholder="비밀번호를 다시 입력하세요"
              autoComplete="new-password"
              size="large"
              invalid={
                confirmPassword.length > 0 && password !== confirmPassword
              }
              errorMessage={
                confirmPassword.length > 0 && password !== confirmPassword
                  ? "비밀번호가 일치하지 않습니다"
                  : undefined
              }
              onChange={(value) => setConfirmPassword(value)}
            />
            <TextArea
              label="신청 사유"
              value={reason}
              placeholder="프로젝트 오너 권한이 필요한 이유를 작성해주세요."
              rows={4}
              helperText="관리자가 검토 후 승인합니다."
              onChange={(value) => setReason(value)}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="large"
                onClick={() => {
                  setStep("email");
                  setError("");
                }}
              >
                이전
              </Button>
              <Button
                variant="primary"
                size="large"
                fullWidth
                loading={submitLoading}
                disabled={submitLoading}
                onClick={handleSubmit}
              >
                신청하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
