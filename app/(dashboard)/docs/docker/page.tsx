"use client";

import { DocsLayout } from "@/components/docs/docs-layout";

export default function DockerPage() {
  return (
    <DocsLayout>
      <h1>Docker 사용시 주의사항</h1>

      <h2>MTU 불일치 문제</h2>
      <p>
        GSMSV 내부 VPS는 외부 클라우드 VPS에서 공인 IP를 <strong>GRE 터널</strong>로 받아
        사용합니다. GRE 헤더가 추가되는 만큼 실질적으로 사용 가능한 MTU가 기본값
        1500보다 작은 <strong>1400</strong>으로 고정돼 있습니다.
      </p>
      <p>
        Docker 네트워크의 기본 MTU는 1500입니다. 컨테이너 내부에서 나가는 패킷이
        1500 기준으로 생성된 뒤 GRE 구간에서 초과분이 버려지기 때문에, 별도 설정
        없이는 <strong>외부 HTTP 요청이 응답 없이 실패</strong>합니다.
      </p>
      <blockquote>
        <p>
          이 문제는 운영 서버뿐 아니라 <strong>모든 내부 VPS에 공통으로 적용</strong>되는
          사안입니다.
        </p>
      </blockquote>

      <h2>해결 방법</h2>
      <p>Docker 네트워크의 MTU를 1400으로 맞춰야 합니다. 방법은 두 가지입니다.</p>

      <h3>방법 1 — docker-compose.yml 에서 네트워크 단위 설정 (권장)</h3>
      <pre><code>{`services:
  your-service:
    # ... 기존 설정 ...
    networks:
      - gsmsv-net

networks:
  gsmsv-net:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: "1400"`}</code></pre>

      <h3>방법 2 — Docker 데몬 전역 설정</h3>
      <p>
        호스트의 모든 Docker 네트워크에 일괄 적용하려면{" "}
        <code>/etc/docker/daemon.json</code>을 수정합니다.
      </p>
      <pre><code>{`{ "mtu": 1400 }`}</code></pre>
      <p>수정 후 Docker 데몬을 재시작합니다.</p>
      <pre><code>sudo systemctl restart docker</code></pre>

      <h2>설정 확인</h2>
      <p>컨테이너 내부에서 네트워크 인터페이스 MTU를 직접 확인할 수 있습니다.</p>
      <pre><code>ip link show eth0</code></pre>
      <p>
        출력의 <code>mtu</code> 값이 <code>1400</code>이면 정상입니다.
      </p>

      <h2>주의 사항</h2>
      <ul>
        <li>기존에 생성된 네트워크는 재생성해야 변경이 적용됩니다 (<code>docker compose down && docker compose up</code>).</li>
        <li>데몬 전역 설정 변경 시 이미 실행 중인 컨테이너는 재시작이 필요합니다.</li>
      </ul>
    </DocsLayout>
  );
}
