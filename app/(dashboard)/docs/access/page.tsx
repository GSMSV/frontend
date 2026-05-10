"use client";

import { DocsLayout } from "@/components/docs/docs-layout";

export default function AccessPage() {
  return (
    <DocsLayout>
      <h1>접속 방법</h1>

      <h2>포트 구조</h2>
      <p>VM 생성 시 아래 세 가지 포트가 자동으로 할당됩니다.</p>
      <table>
        <thead>
          <tr>
            <th>용도</th>
            <th>설명</th>
            <th>프로토콜</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>SSH</strong></td><td>VM SSH 접속</td><td>TCP</td></tr>
          <tr><td><strong>HTTP</strong></td><td>웹 서비스(80번)</td><td>TCP</td></tr>
          <tr><td><strong>SVC</strong></td><td>커스텀 서비스(10000번)</td><td>TCP + UDP</td></tr>
        </tbody>
      </table>

      <h2>SSH 접속</h2>
      <pre><code>ssh ubuntu@ssh.gsmsv.site -p &lt;SSH 포트&gt;</code></pre>
      <ul>
        <li>호스트: <code>ssh.gsmsv.site</code></li>
        <li>포트: 인스턴스 상세 페이지의 SSH 포트</li>
        <li>계정: <code>ubuntu</code></li>
        <li>비밀번호: 인스턴스 상세 페이지에서 확인 (초기 비밀번호)</li>
      </ul>

      <h3>예시</h3>
      <p>SSH 포트가 <code>10101</code>로 표시된 경우:</p>
      <pre><code>ssh ubuntu@ssh.gsmsv.site -p 10101</code></pre>
      <p>접속 후 비밀번호를 변경하는 것을 권장합니다.</p>
      <pre><code>passwd</code></pre>

      <h2>웹 서비스 접속</h2>
      <pre><code>http://ssh.gsmsv.site:&lt;HTTP 포트&gt;</code></pre>

      <h2>SVC 포트 활용</h2>
      <p>
        VM에서 10000번 포트로 실행 중인 서비스에 외부에서 접근하려면 할당된 SVC
        포트를 사용합니다. TCP와 UDP를 모두 지원합니다.
      </p>
    </DocsLayout>
  );
}
