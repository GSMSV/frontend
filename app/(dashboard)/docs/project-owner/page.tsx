"use client";

import { DocsLayout } from "@/components/docs/docs-layout";

export default function ProjectOwnerPage() {
  return (
    <DocsLayout>
      <h1>프로젝트 오너</h1>

      <h2>프로젝트 오너란?</h2>
      <p>
        <strong>프로젝트 오너(PROJECT_OWNER)</strong>는 교내 프로젝트에 참여하는
        학생을 위한 계정 유형입니다. 일반 사용자보다 더 많은 리소스와 권한을
        제공합니다.
      </p>

      <h2>일반 사용자와의 차이점</h2>
      <table>
        <thead>
          <tr>
            <th>기능</th>
            <th>일반 사용자(USER)</th>
            <th>프로젝트 오너(PO)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>VM 생성 한도</td><td>최대 3개</td><td>무제한</td></tr>
          <tr><td>VM 만료</td><td>30일</td><td>없음</td></tr>
          <tr><td>사양 선택</td><td>정해진 티어</td><td>커스텀 사양</td></tr>
          <tr><td>핫플러그 리사이징</td><td>불가</td><td>가능</td></tr>
          <tr><td>전용 노드</td><td>일반 노드</td><td>GPU 3 노드</td></tr>
        </tbody>
      </table>

      <h2>가입 방법</h2>
      <ol>
        <li><code>/signup/project</code> 페이지에 접속합니다.</li>
        <li>DataGSM에서 프로젝트 참여 여부를 확인합니다.</li>
        <li>참여 중인 프로젝트를 선택합니다.</li>
        <li>비밀번호와 사용 사유를 입력합니다.</li>
        <li>이메일 인증을 완료합니다.</li>
        <li><strong>관리자 승인</strong>을 기다립니다.</li>
      </ol>
      <blockquote>
        <p>프로젝트당 오너 계정은 <strong>1명</strong>으로 제한됩니다.</p>
      </blockquote>

      <h2>핫플러그 리사이징</h2>
      <p>
        프로젝트 오너는 VM을 재시작하지 않고도 CPU와 메모리를 실시간으로 변경할
        수 있습니다.
      </p>
      <ul>
        <li><strong>CPU</strong>: 2 ~ 8 코어</li>
        <li><strong>RAM</strong>: 2GB ~ 32GB</li>
      </ul>
      <p>
        인스턴스 상세 페이지 → <strong>설정 탭</strong>에서 변경할 수 있습니다.
      </p>
    </DocsLayout>
  );
}
