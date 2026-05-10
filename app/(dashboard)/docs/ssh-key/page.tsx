"use client";

import { DocsLayout } from "@/components/docs/docs-layout";

export default function SshKeyPage() {
  return (
    <DocsLayout>
      <h1>SSH Key 등록</h1>

      <h2>SSH Key란?</h2>
      <p>
        SSH Key는 비밀번호 대신 사용할 수 있는 안전한 인증 방식입니다.
        공개키와 개인키 쌍으로 구성되며, 공개키를 VM에 등록하면 비밀번호 없이
        SSH 접속이 가능합니다.
      </p>

      <h2>SSH Key 생성</h2>
      <pre><code>ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_gsmsv</code></pre>
      <blockquote>
        <p>이미 다른 키가 있다면 <code>-f</code> 옵션으로 다른 경로를 지정하세요.</p>
      </blockquote>

      <h3>생성된 키</h3>
      <table>
        <thead>
          <tr><th>파일</th><th>설명</th></tr>
        </thead>
        <tbody>
          <tr><td><code>~/.ssh/id_ed25519_gsmsv</code></td><td>개인키 (절대 공유 금지)</td></tr>
          <tr><td><code>~/.ssh/id_ed25519_gsmsv.pub</code></td><td>공개키 (VM에 등록)</td></tr>
        </tbody>
      </table>

      <h2>공개키 복사</h2>
      <h3>Windows</h3>
      <pre><code>Get-Content ~/.ssh/id_ed25519_gsmsv.pub | Set-Clipboard</code></pre>
      <h3>macOS</h3>
      <pre><code>cat ~/.ssh/id_ed25519_gsmsv.pub | pbcopy</code></pre>
      <h3>Linux</h3>
      <pre><code>cat ~/.ssh/id_ed25519_gsmsv.pub | xclip -selection clipboard</code></pre>

      <h2>VM에 공개키 등록</h2>
      <h3>1. VM에 SSH 접속</h3>
      <pre><code>ssh ubuntu@ssh.gsmsv.site -p &lt;SSH 포트&gt;</code></pre>

      <h3>2. authorized_keys에 추가</h3>
      <pre><code>{`mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "공개키_내용" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys`}</code></pre>

      <h3>3. 접속 테스트</h3>
      <pre><code>ssh -i ~/.ssh/id_ed25519_gsmsv ubuntu@ssh.gsmsv.site -p &lt;SSH 포트&gt;</code></pre>

      <h2>비밀번호 인증 비활성화 (권장)</h2>
      <pre><code>{`sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config.d/60-cloudimg-settings.conf
sudo systemctl restart sshd`}</code></pre>

      <h2>주의 사항</h2>
      <ul>
        <li><strong>개인키는 절대 공유하지 마세요.</strong></li>
        <li>패스프레이즈를 설정하면 추가 보안이 제공됩니다.</li>
      </ul>
    </DocsLayout>
  );
}
