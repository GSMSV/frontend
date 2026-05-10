"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Badge,
  BottomInfo,
  Button,
  Card,
  Dialog,
  IconButton,
  Spinner,
  Text,
  TextArea,
} from "@zaemoru/react";

import {
  type FaqQuestionItem,
  answerFaqQuestion,
  deleteFaqQuestion,
  getFaqQuestions,
  submitFaqQuestion,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

import { DocsLayout } from "@/components/docs/docs-layout";

export default function QuestionsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [questions, setQuestions] = useState<FaqQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [answerSubmitting, setAnswerSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<FaqQuestionItem | null>(
    null,
  );

  const fetchQuestions = useCallback(async () => {
    try {
      const data = await getFaqQuestions();
      setQuestions(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmit = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError("");
    try {
      await submitFaqQuestion(trimmed);
      setSubmitted(true);
      setQuestion("");
      fetchQuestions();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "질문 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = async (id: number) => {
    if (!answerText.trim()) return;
    setAnswerSubmitting(true);
    try {
      await answerFaqQuestion(id, answerText.trim());
      setAnsweringId(null);
      setAnswerText("");
      fetchQuestions();
    } catch {
      /* ignore */
    } finally {
      setAnswerSubmitting(false);
    }
  };

  const handleDelete = async (item: FaqQuestionItem) => {
    try {
      await deleteFaqQuestion(item.id);
      setDeleteTarget(null);
      fetchQuestions();
    } catch {
      /* ignore */
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <DocsLayout>
      <h1>질문 등록</h1>
      <p>궁금한 점이 있으시면 아래에 질문을 남겨주세요. 관리자가 확인 후 답변드립니다.</p>

      <div className="not-prose mt-6">
        <Card elevation="low" padding="medium">
          <TextArea
            placeholder="질문 내용을 입력해주세요 (최대 500자)"
            maxLength={500}
            rows={3}
            value={question}
            onChange={(value) => setQuestion(value)}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <Text size="xs" tone="muted">
              {question.length}/500
            </Text>
            <div className="flex items-center gap-2">
              {submitted && (
                <Text size="sm" tone="primary">
                  ✓ 등록되었습니다
                </Text>
              )}
              {error && (
                <Text size="sm" tone="danger">
                  {error}
                </Text>
              )}
              <Button
                variant="primary"
                size="small"
                disabled={!question.trim() || submitting}
                loading={submitting}
                onClick={handleSubmit}
              >
                질문 등록
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <h2>{isAdmin ? "전체 질문 목록" : "내 질문 목록"}</h2>

      <div className="not-prose flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="medium" />
          </div>
        ) : questions.length === 0 ? (
          <BottomInfo>아직 등록된 질문이 없습니다.</BottomInfo>
        ) : (
          questions.map((q) => (
            <Card key={q.id} elevation="low" padding="medium">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {isAdmin && (
                    <Text size="xs" tone="muted">
                      {q.user_email}
                    </Text>
                  )}
                  <Text size="sm">{q.question}</Text>
                </div>
                <div className="flex items-center gap-2">
                  {q.answer ? (
                    <Badge variant="weak" size="small" color="green">
                      답변 완료
                    </Badge>
                  ) : (
                    <Badge variant="weak" size="small" color="yellow">
                      대기 중
                    </Badge>
                  )}
                  <IconButton
                    variant="ghost"
                    size="small"
                    ariaLabel="삭제"
                    onClick={() => setDeleteTarget(q)}
                  >
                    🗑
                  </IconButton>
                </div>
              </div>
              <Text size="xs" tone="muted">
                {formatDate(q.created_at)}
              </Text>

              {q.answer && (
                <div className="mt-3 border-t border-[var(--zm-color-border-subtle,#e5e7eb)] pt-3">
                  <Text size="xs" weight="semibold" tone="primary">
                    💬 관리자 답변
                  </Text>
                  {q.answered_at && (
                    <Text size="xs" tone="muted">
                      {formatDate(q.answered_at)}
                    </Text>
                  )}
                  <Text size="sm">{q.answer}</Text>
                </div>
              )}

              {isAdmin && !q.answer && (
                <div className="mt-3 border-t border-[var(--zm-color-border-subtle,#e5e7eb)] pt-3">
                  {answeringId === q.id ? (
                    <div className="flex flex-col gap-2">
                      <TextArea
                        placeholder="답변을 입력해주세요"
                        rows={3}
                        value={answerText}
                        onChange={(value) => setAnswerText(value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => {
                            setAnsweringId(null);
                            setAnswerText("");
                          }}
                        >
                          취소
                        </Button>
                        <Button
                          variant="primary"
                          size="small"
                          disabled={!answerText.trim() || answerSubmitting}
                          loading={answerSubmitting}
                          onClick={() => handleAnswer(q.id)}
                        >
                          답변 등록
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        setAnsweringId(q.id);
                        setAnswerText("");
                      }}
                    >
                      답변 작성
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <Dialog
        open={!!deleteTarget}
        kind="confirm"
        title="질문 삭제"
        description="이 질문을 삭제하시겠습니까? 삭제된 질문은 복구할 수 없습니다."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </DocsLayout>
  );
}
