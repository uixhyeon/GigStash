<template>
  <div class="icon-demo">
    <div class="demo-header">
      <h1>3D 아이콘 데모</h1>
      <p>iOS 스타일의 3D 글래스모피즘 아이콘 예시</p>
    </div>

    <section class="demo-section">
      <h2>메인 메뉴 아이콘</h2>
      <div class="icon-grid">
        <div class="icon-card">
          <div class="icon-3d icon-3d--dashboard"></div>
          <span>대시보드</span>
        </div>
        <div class="icon-card">
          <div class="icon-3d icon-3d--lock"></div>
          <span>사물함 관리</span>
        </div>
        <div class="icon-card">
          <div class="icon-3d icon-3d--calendar"></div>
          <span>예약 관리</span>
        </div>
        <div class="icon-card">
          <div class="icon-3d icon-3d--users"></div>
          <span>고객 관리</span>
        </div>
        <div class="icon-card">
          <div class="icon-3d icon-3d--chart"></div>
          <span>통계 분석</span>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>보조 메뉴 아이콘</h2>
      <div class="icon-grid">
        <div class="icon-card">
          <div class="icon-3d icon-3d--palette"></div>
          <span>컴포넌트</span>
        </div>
        <div class="icon-card">
          <div class="icon-3d icon-3d--settings"></div>
          <span>설정</span>
        </div>
        <div class="icon-card">
          <div class="icon-3d icon-3d--user"></div>
          <span>사용자</span>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>로고 아이콘</h2>
      <div class="icon-grid">
        <div class="icon-card">
          <div class="icon-3d icon-3d--cube"></div>
          <span>GigStash</span>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>크기 변형</h2>
      <div class="icon-grid">
        <div class="icon-card">
          <div class="icon-3d icon-3d--dashboard icon-3d--small"></div>
          <span>Small (24px)</span>
        </div>
        <div class="icon-card">
          <div class="icon-3d icon-3d--dashboard"></div>
          <span>Normal (32px)</span>
        </div>
        <div class="icon-card">
          <div class="icon-3d icon-3d--dashboard icon-3d--large"></div>
          <span>Large (48px)</span>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>인터랙션 효과</h2>
      <p class="demo-description">아이콘에 마우스를 올려보세요</p>
      <div class="icon-grid">
        <div class="icon-card interactive">
          <div class="icon-3d icon-3d--dashboard"></div>
          <span>Hover Effect</span>
        </div>
        <div class="icon-card interactive active">
          <div class="icon-3d icon-3d--lock"></div>
          <span>Active State</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// 이 컴포넌트는 3D 아이콘 스타일을 보여주는 데모 페이지입니다
</script>

<style scoped>
.icon-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  margin-bottom: 3rem;
}

.demo-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.demo-header p {
  font-size: 1.125rem;
  color: #64748b;
}

.demo-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.demo-description {
  color: #64748b;
  margin-bottom: 1rem;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 2rem;
}

.icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.icon-card span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  text-align: center;
}

.icon-card.interactive:hover {
  background: #f1f5f9;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 3D iOS-style Icons */
.icon-3d {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(59, 130, 246, 0.95));
  box-shadow:
    0 4px 12px rgba(59, 130, 246, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-3d::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0) 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
}

.icon-3d::after {
  position: absolute;
  color: white;
  font-size: 16px;
  font-weight: 600;
  z-index: 1;
}

.icon-3d--small {
  width: 24px;
  height: 24px;
  border-radius: 8px;
}

.icon-3d--small::after {
  font-size: 12px;
}

.icon-3d--large {
  width: 48px;
  height: 48px;
  border-radius: 14px;
}

.icon-3d--large::after {
  font-size: 24px;
}

/* Icon specific styles */
.icon-3d--cube {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.9), rgba(14, 165, 233, 0.95));
  box-shadow:
    0 4px 12px rgba(14, 165, 233, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.icon-3d--cube::after {
  content: '◆';
  font-size: 20px;
}

.icon-3d--dashboard::after {
  content: '▦';
}

.icon-3d--lock {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(147, 51, 234, 0.95));
  box-shadow:
    0 4px 12px rgba(147, 51, 234, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.icon-3d--lock::after {
  content: '🔒';
  font-size: 14px;
}

.icon-3d--calendar {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.9), rgba(249, 115, 22, 0.95));
  box-shadow:
    0 4px 12px rgba(249, 115, 22, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.icon-3d--calendar::after {
  content: '■';
  font-size: 12px;
  transform: translateY(-2px);
}

.icon-3d--users {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.95));
  box-shadow:
    0 4px 12px rgba(22, 163, 74, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.icon-3d--users::after {
  content: '◉◉';
  font-size: 10px;
  letter-spacing: -3px;
}

.icon-3d--chart {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.9), rgba(219, 39, 119, 0.95));
  box-shadow:
    0 4px 12px rgba(219, 39, 119, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.icon-3d--chart::after {
  content: '▁▄▆';
  font-size: 12px;
  letter-spacing: -1px;
}

.icon-3d--palette {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.9), rgba(245, 158, 11, 0.95));
  box-shadow:
    0 4px 12px rgba(245, 158, 11, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.icon-3d--palette::after {
  content: '◐';
}

.icon-3d--settings {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.9), rgba(75, 85, 99, 0.95));
  box-shadow:
    0 4px 12px rgba(75, 85, 99, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.icon-3d--settings::after {
  content: '⚙';
  font-size: 18px;
}

.icon-3d--user::after {
  content: '◉';
  font-size: 14px;
}

/* Hover effects */
.interactive:hover .icon-3d {
  transform: translateY(-2px) scale(1.05);
  box-shadow:
    0 6px 16px rgba(59, 130, 246, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.4),
    inset 0 -2px 4px rgba(0, 0, 0, 0.15);
}

/* Active state */
.icon-card.active .icon-3d {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9)) !important;
  box-shadow:
    0 4px 12px rgba(255, 255, 255, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.05) !important;
}

.icon-card.active .icon-3d::after {
  color: #3b82f6;
}

/* Dark mode */
:global(.dark) .demo-section {
  background: #1e293b;
}

:global(.dark) .demo-section h2 {
  color: #f1f5f9;
}

:global(.dark) .demo-description {
  color: #94a3b8;
}

:global(.dark) .icon-card {
  background: #334155;
}

:global(.dark) .icon-card span {
  color: #cbd5e1;
}

:global(.dark) .icon-card.interactive:hover {
  background: #475569;
}

:global(.dark) .icon-3d {
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
}

:global(.dark) .icon-card.active .icon-3d {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.85)) !important;
}

:global(.dark) .icon-card.active .icon-3d::after {
  color: #06b6d4;
}
</style>
