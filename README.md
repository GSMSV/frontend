# GSMSV Frontend

광주소프트웨어마이스터고 VM 신청·관리 플랫폼의 프론트엔드.

[zaemoru](https://github.com/zaewc/zaemoru) 디자인 시스템 기반.

## 스택

- Next.js 16 (App Router)
- React 19 / TypeScript
- Tailwind CSS v4
- @zaemoru/react + @zaemoru/tokens
- recharts (메트릭 차트)

## 디렉터리

- `app/` Next.js 라우트
- `components/` 화면 컴포넌트
- `lib/api.ts` 백엔드 API 호출 함수
- `lib/types.ts` 공용 타입
- `lib/auth-context.tsx` 인증 상태
- `lib/notification-context.tsx` 알림 상태
- `proxy.ts` 인증 미들웨어 (구 middleware.ts)

## 백엔드 연동

이 프론트엔드는 [GSMSV/GSM-SV](https://github.com/GSMSV/GSM-SV) 의 FastAPI 백엔드와
함께 동작해요. Next.js rewrite (`next.config.mjs`) 가 `/api/*` 를 백엔드로
프록시하므로, 브라우저는 모든 요청을 same-origin 으로 인식하고 httpOnly 쿠키가
정상 작동합니다.

## 로컬 실행

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local.example` 을 `.env.local` 로 복사하고 백엔드 URL 을 지정합니다.

```bash
cp .env.local.example .env.local
```

```env
BACKEND_URL=http://localhost:8000
```

프로덕션 서버의 백엔드에 직접 붙여 확인할 때는 다음처럼 설정합니다.

```env
BACKEND_URL=https://gsmsv.site
```

### 3. 백엔드 실행 (별도 레포)

`/Users/user/Desktop/GSMSV/GSM-SV` 의 백엔드를 먼저 띄웁니다.

```bash
cd ../GSM-SV/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# .env 작성 (.env.example 참고). SECRET_KEY 등 필수값 설정 필요.
cp ../.env.example ../.env
# SECRET_KEY 생성:
python -c "import secrets; print(secrets.token_urlsafe(64))"

# 서버 시작 (8000 포트)
uvicorn main:app --reload --port 8000
```

> 백엔드의 CORS_ORIGINS 와 OAUTH_REDIRECT_URI 는 `http://localhost:3000` 기준으로
> 이미 설정돼 있어요. 다른 포트로 실행하면 백엔드 `.env` 도 함께 수정.

### 4. 프론트엔드 실행

```bash
pnpm dev
```

`http://localhost:3000` 접속 → 미들웨어가 비로그인 사용자를 `/login` 으로 리다이렉트.

## 인증 흐름

1. `/login` 폼 제출 → `/api/v1/auth/login` (rewrite → backend)
2. 백엔드가 `access_token` · `refresh_token` httpOnly 쿠키 설정 (samesite=lax, secure=프로덕션만)
3. AuthProvider 가 `/api/v1/auth/me` 로 사용자 정보 조회
4. 401 응답 시 lib/api.ts 가 `/api/v1/auth/refresh` 로 자동 재시도
5. 미들웨어 `proxy.ts` 가 보호 라우트에서 쿠키 부재 시 `/login` 으로 리다이렉트

## 컨벤션

커밋: `type: 한국어 설명` (feat/fix/update/add/docs/style/refactor/test/perf/merge), 마침표 없음
브랜치: `develop` 분기 → feature → PR → develop → main. `main` 직접 push 금지

## 빌드

```bash
pnpm build   # 프로덕션 빌드
pnpm start   # 프로덕션 서버
pnpm lint    # ESLint
```
