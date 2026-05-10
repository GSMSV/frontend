# GSMSV Frontend

광주소프트웨어마이스터고 VM 신청·관리 플랫폼의 프론트엔드.

[zaemoru](https://github.com/zaewc/zaemoru) 디자인 시스템 기반으로 리메이크 중.

## 스택

- Next.js 16 (App Router)
- React 19 / TypeScript
- Tailwind CSS v4
- @zaemoru/react + @zaemoru/tokens

## 개발

```bash
pnpm install
pnpm dev
```

`http://localhost:3000` 에서 확인.

## 환경변수

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

`.env.local` 에 작성.

## 디렉터리

- `app/` Next.js 라우트
- `components/` 화면 컴포넌트 (zaemoru 래퍼 포함)
- `lib/` `api.ts` · `types.ts` · 유틸
