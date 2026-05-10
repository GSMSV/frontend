# GSMSV Frontend — Claude 지침서

zaemoru 디자인 시스템 기반 GSMSV 프론트엔드. 백엔드(`../GSM-SV/backend`)와 별도 레포로 분리됨.

## 스택

Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · `@zaemoru/react` (Lit 기반 Web Components 래퍼)

## zaemoru 사용 규칙

- `@zaemoru/tokens/index.css` 는 `app/globals.css` 에서 한 번만 import
- `@zaemoru/react` 는 Web Components 등록을 트리거하므로 클라이언트 컴포넌트(`"use client"`)에서만 import. 등록은 `app/providers.tsx` 에서 수행
- 기본 UI 는 zaemoru 컴포넌트(`Button`, `TextField`, `Card` 등)를 우선 사용. 자체 styled 컴포넌트로 덮어쓰지 않음
- 레이아웃·간격은 Tailwind 유틸리티로 작성
- shadcn/ui 컴포넌트는 도입하지 않음 (zaemoru로 대체)

## 디렉터리

- `app/` 라우트
- `components/` 화면 단위 컴포넌트
- `lib/api.ts` 백엔드 호출 함수, `lib/types.ts` 공용 타입, `lib/utils.ts` `cn()` 등 유틸

## 백엔드 연동

`NEXT_PUBLIC_API_URL` (기본 `http://localhost:8000`) 로 FastAPI 호출. Next rewrite 로 `/api/*` 를 백엔드로 프록시 — same-origin httpOnly 쿠키 기반 인증.

- 인증: JWT (access 30분 / refresh 7일) httpOnly 쿠키
- 자동 갱신: 401 응답 시 `lib/api.ts` 가 `/api/v1/auth/refresh` 로 1회 재시도
- 보호 라우트: `proxy.ts` 미들웨어가 `access_token` 쿠키 부재 시 `/login` 리다이렉트
- 백엔드 레포: `../GSM-SV` (별도 레포)

## 컨벤션

커밋: `type: 한국어 설명` (feat/fix/update/add/docs/style/refactor/test/perf/merge), 마침표 없음, Co-Authored-By 포함
브랜치: `develop` 분기 → feature → PR → develop → main. `main` 직접 push 금지

## 리메이크 로드맵

1. 인증 (login/signup/verify/reset-password) — `@zaemoru/react` `TextField`, `Button`, `Agreement`
2. 대시보드 셸 (sidebar/topbar) — `Header`, `SideNavigation`, `MainMenu`
3. VM 인스턴스 목록·상세 (탭) — `Table`, `Tab`, `Card`, `Badge`
4. VM 신청 위저드 — `ProgressStepper`, `Select`, `RadioButton`, `BottomCta`
5. 알림·토스트 — `Toast`, `Snackbar`
6. 어드민 승인 페이지 — `Table`, `Dialog`
7. FAQ/Docs — `Accordion`, `SideNavigation`

각 단계는 별도 PR. 백엔드 API 시그니처는 `../GSM-SV/backend` 의 `main.py` 라우터에서 확인.
