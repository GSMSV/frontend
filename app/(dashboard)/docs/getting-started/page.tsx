"use client";

import { DocsLayout } from "@/components/docs/docs-layout";

export default function GettingStartedPage() {
  return (
    <DocsLayout>
      <h1>시작하기</h1>

      <h2>GSM SV에 대하여</h2>
      <p>
        <strong>GSM SV</strong>는 광주소프트웨어마이스터고등학교 학생들의 공부와
        프로젝트 배포를 돕기 위해 만들어진 교내 IaaS 플랫폼입니다. 교내에 유휴
        상태로 있는 GPU 서버 자원을 통합하여, 학생 누구나 비용 부담 없이 가상
        서버(VM)를 자유롭게 사용할 수 있습니다.
      </p>

      <h2>서비스 도메인</h2>
      <table>
        <thead>
          <tr>
            <th>도메인</th>
            <th>용도</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>gsmsv.site</code></td>
            <td>서비스 웹페이지 (콘솔 접속)</td>
          </tr>
          <tr>
            <td><code>ssh.gsmsv.site</code></td>
            <td>VM SSH 접속용 도메인</td>
          </tr>
          <tr>
            <td><code>service.gsmsv.site</code></td>
            <td>VM 웹 서비스(HTTP/SVC) 접속용 도메인</td>
          </tr>
        </tbody>
      </table>

      <h2>이용 시 주의사항</h2>
      <ul>
        <li>인스턴스 배포 시 제공되는 초기 비밀번호는 변경하거나 SSH Key를 설정하는 것을 추천합니다.</li>
        <li>일반 사용자(USER)의 VM은 생성 후 <strong>30일이 지나면 자동 삭제</strong>됩니다.</li>
        <li>교육 목적에 맞지 않는 용도로 사용할 경우 사전 안내 없이 인스턴스가 삭제될 수 있습니다.</li>
      </ul>

      <h2>제공 기능</h2>
      <ul>
        <li><strong>VM 프로비저닝</strong> — Ubuntu 22.04 LTS 기반 VM 생성</li>
        <li><strong>전원 제어</strong> — 시작·종료·재시작</li>
        <li><strong>포트포워딩</strong> — SSH·HTTP·SVC 자동 할당</li>
        <li><strong>방화벽 관리</strong> — VM 레벨 방화벽 규칙 추가/삭제</li>
        <li><strong>리소스 모니터링</strong> — CPU·RAM 실시간 그래프</li>
        <li><strong>알림</strong> — VM 생성/삭제 및 리소스 경고 알림</li>
      </ul>

      <h2>계정 유형</h2>
      <table>
        <thead>
          <tr>
            <th>역할</th>
            <th>설명</th>
            <th>VM 한도</th>
            <th>만료</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>USER</strong></td>
            <td>재학생 일반 계정</td>
            <td>최대 3개</td>
            <td>30일</td>
          </tr>
          <tr>
            <td><strong>PROJECT_OWNER</strong></td>
            <td>교내 프로젝트 참여자 계정</td>
            <td>무제한</td>
            <td>없음</td>
          </tr>
        </tbody>
      </table>
      <blockquote>
        <p><strong>가입 조건:</strong> DataGSM에 등록된 GSM 재학생만 가입할 수 있습니다.</p>
      </blockquote>
    </DocsLayout>
  );
}
