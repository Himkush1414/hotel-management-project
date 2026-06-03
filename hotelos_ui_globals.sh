#!/bin/bash
cd ~/Downloads/hotel-management-project
python3 << 'PYEOF'
path = "src/app/globals.css"
content = '''@import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap");

/* ═══════════════════════════════════════════════════════════════
   CSS CUSTOM PROPERTIES — HotelOS Design System
   ═══════════════════════════════════════════════════════════════ */

:root {
  /* Backgrounds */
  --bg-base:           #0a0a0f;
  --bg-surface:        #111118;
  --bg-elevated:       #16161f;
  --bg-hover:          #1c1c28;

  /* Borders */
  --border:            rgba(255, 255, 255, 0.07);
  --border-hover:      rgba(255, 255, 255, 0.13);
  --border-active:     rgba(108, 92, 231, 0.5);

  /* Accent — Primary Purple */
  --accent:            #6c5ce7;
  --accent-hover:      #7d6ff0;
  --accent-light:      #a29bfe;
  --accent-glow:       rgba(108, 92, 231, 0.15);

  /* Text */
  --text-primary:      #f0f0f8;
  --text-secondary:    rgba(240, 240, 248, 0.6);
  --text-muted:        rgba(240, 240, 248, 0.35);

  /* Semantic Colors */
  --green:             #00b894;
  --green-bg:          rgba(0, 184, 148, 0.1);
  --green-border:      rgba(0, 184, 148, 0.25);

  --blue:              #74b9ff;
  --blue-bg:           rgba(116, 185, 255, 0.1);
  --blue-border:       rgba(116, 185, 255, 0.25);

  --amber:             #fdcb6e;
  --amber-bg:          rgba(253, 203, 110, 0.1);
  --amber-border:      rgba(253, 203, 110, 0.25);

  --red:               #e17055;
  --red-bg:            rgba(225, 112, 85, 0.1);
  --red-border:        rgba(225, 112, 85, 0.25);

  --purple:            #a29bfe;
  --purple-bg:         rgba(162, 155, 254, 0.1);
  --purple-border:     rgba(162, 155, 254, 0.25);

  /* Shadows */
  --shadow-card:       0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-modal:      0 24px 64px rgba(0, 0, 0, 0.6);
  --shadow-elevated:   0 8px 32px rgba(0, 0, 0, 0.5);

  /* Border Radius */
  --radius-sm:         8px;
  --radius-md:         12px;
  --radius-lg:         16px;
  --radius-xl:         20px;
  --radius-2xl:        24px;

  /* Sidebar dimensions */
  --sidebar-collapsed: 64px;
  --sidebar-expanded:  220px;

  /* Transitions */
  --transition-fast:   150ms ease;
  --transition-base:   180ms ease;
  --transition-slow:   220ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ═══════════════════════════════════════════════════════════════
   RESET & BASE
   ═══════════════════════════════════════════════════════════════ */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-family: "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  min-height: 100vh;
  overflow-x: hidden;
}

::selection {
  background: rgba(108, 92, 231, 0.3);
  color: #fff;
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOM SCROLLBAR
   ═══════════════════════════════════════════════════════════════ */

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  transition: background var(--transition-fast);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

::-webkit-scrollbar-corner {
  background: transparent;
}

* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

/* ═══════════════════════════════════════════════════════════════
   TYPOGRAPHY HIERARCHY
   ═══════════════════════════════════════════════════════════════ */

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  line-height: 1.3;
}

.page-sub {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-secondary);
  margin-top: 2px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.mono {
  font-family: "DM Mono", "Cascadia Code", "Fira Code", monospace;
  font-weight: 400;
}

.mono-medium {
  font-family: "DM Mono", "Cascadia Code", "Fira Code", monospace;
  font-weight: 500;
}

/* ═══════════════════════════════════════════════════════════════
   CARD SURFACE
   ═══════════════════════════════════════════════════════════════ */

.card-surface {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);
}

.card-surface:hover {
  border-color: var(--border-hover);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  transform: translateY(-1px);
}

.card-interactive {
  cursor: pointer;
}

.card-interactive:hover {
  border-color: var(--border-hover);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}

/* ═══════════════════════════════════════════════════════════════
   STATUS PILLS / BADGES
   ═══════════════════════════════════════════════════════════════ */

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 99px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2px;
  white-space: nowrap;
  line-height: 1.5;
}

.pill-green {
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid var(--green-border);
}

.pill-blue {
  background: var(--blue-bg);
  color: var(--blue);
  border: 1px solid var(--blue-border);
}

.pill-amber {
  background: var(--amber-bg);
  color: var(--amber);
  border: 1px solid var(--amber-border);
}

.pill-red {
  background: var(--red-bg);
  color: var(--red);
  border: 1px solid var(--red-border);
}

.pill-purple {
  background: var(--purple-bg);
  color: var(--purple);
  border: 1px solid var(--purple-border);
}

.pill-gray {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ═══════════════════════════════════════════════════════════════
   DATA TABLE
   ═══════════════════════════════════════════════════════════════ */

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead tr {
  background: rgba(255, 255, 255, 0.03);
}

.data-table thead th {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 10px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  user-select: none;
}

.data-table thead th:first-child {
  border-radius: var(--radius-sm) 0 0 0;
}

.data-table thead th:last-child {
  border-radius: 0 var(--radius-sm) 0 0;
}

.data-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background var(--transition-fast);
}

.data-table tbody tr:last-child {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.data-table tbody td {
  padding: 14px 16px;
  color: var(--text-primary);
  vertical-align: middle;
}

.data-table tbody td.muted {
  color: var(--text-secondary);
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Sticky first column on mobile */
@media (max-width: 640px) {
  .data-table th:first-child,
  .data-table td:first-child {
    position: sticky;
    left: 0;
    background: var(--bg-surface);
    z-index: 1;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  }
}

/* ═══════════════════════════════════════════════════════════════
   BUTTONS
   ═══════════════════════════════════════════════════════════════ */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 10px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 500;
  font-family: "DM Sans", sans-serif;
  cursor: pointer;
  border: none;
  text-decoration: none;
  white-space: nowrap;
  transition: all var(--transition-fast);
  user-select: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.btn:active {
  transform: scale(0.97) !important;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(108, 92, 231, 0.25);
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(108, 92, 231, 0.4);
}

.btn-secondary {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.btn-secondary:hover {
  border-color: rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-1px);
}

.btn-danger {
  background: rgba(225, 112, 85, 0.12);
  color: var(--red);
  border: 1px solid rgba(225, 112, 85, 0.3);
}

.btn-danger:hover {
  background: rgba(225, 112, 85, 0.2);
  border-color: rgba(225, 112, 85, 0.5);
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
}

.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-sm {
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
  flex-shrink: 0;
}

.btn-icon-lg {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 10px;
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════════════════
   FORM INPUTS
   ═══════════════════════════════════════════════════════════════ */

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.form-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-family: "DM Sans", sans-serif;
  color: var(--text-primary);
  width: 100%;
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  appearance: none;
  -webkit-appearance: none;
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-input:focus {
  border-color: rgba(108, 92, 231, 0.6);
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 36px 10px 12px;
  font-size: 13px;
  font-family: "DM Sans", sans-serif;
  color: var(--text-primary);
  width: 100%;
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(240,240,248,0.35)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.form-select:focus {
  border-color: rgba(108, 92, 231, 0.6);
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
}

.form-select option {
  background: #13131f;
  color: var(--text-primary);
}

.form-textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-family: "DM Sans", sans-serif;
  color: var(--text-primary);
  width: 100%;
  outline: none;
  min-height: 80px;
  resize: vertical;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-textarea::placeholder {
  color: var(--text-muted);
}

.form-textarea:focus {
  border-color: rgba(108, 92, 231, 0.6);
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
}

/* ═══════════════════════════════════════════════════════════════
   MODALS
   ═══════════════════════════════════════════════════════════════ */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: backdropIn 200ms ease;
}

@keyframes backdropIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: #13131f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  padding: 28px;
  width: 100%;
  max-width: 520px;
  max-height: 88vh;
  overflow-y: auto;
  position: relative;
  animation: modalIn 200ms ease;
  box-shadow: var(--shadow-modal);
}

.modal-container-lg {
  max-width: 640px;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
  transition: color var(--transition-fast), background var(--transition-fast);
  line-height: 1;
}

.modal-close:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.08);
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  margin-bottom: 20px;
  padding-right: 32px;
}

.modal-divider {
  height: 1px;
  background: var(--border);
  margin: 20px 0;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

/* Mobile: bottom sheet */
@media (max-width: 640px) {
  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .modal-container {
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    max-width: 100%;
    max-height: 92vh;
    padding: 24px 20px;
  }
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATES
   ═══════════════════════════════════════════════════════════════ */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.empty-state-icon {
  width: 48px;
  height: 48px;
  color: var(--text-muted);
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.empty-state-sub {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 280px;
  line-height: 1.5;
}

.empty-state-cta {
  margin-top: 20px;
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON / LOADING
   ═══════════════════════════════════════════════════════════════ */

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-text {
  height: 14px;
  border-radius: 4px;
}

.skeleton-title {
  height: 22px;
  border-radius: 6px;
}

.skeleton-avatar {
  border-radius: 50%;
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════════════════
   PAGE ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeInUp 250ms ease both;
}

.animate-fade-in-delay-1 {
  animation: fadeInUp 250ms 50ms ease both;
}

.animate-fade-in-delay-2 {
  animation: fadeInUp 250ms 100ms ease both;
}

.animate-fade-in-delay-3 {
  animation: fadeInUp 250ms 150ms ease both;
}

.animate-fade-in-delay-4 {
  animation: fadeInUp 250ms 200ms ease both;
}

/* ═══════════════════════════════════════════════════════════════
   AVATAR INITIALS
   ═══════════════════════════════════════════════════════════════ */

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.avatar-sm {
  width: 28px;
  height: 28px;
  font-size: 11px;
}

.avatar-md {
  width: 32px;
  height: 32px;
  font-size: 12px;
}

.avatar-lg {
  width: 40px;
  height: 40px;
  font-size: 14px;
}

.avatar-xl {
  width: 48px;
  height: 48px;
  font-size: 16px;
}

/* ═══════════════════════════════════════════════════════════════
   STAT / KPI CARDS
   ═══════════════════════════════════════════════════════════════ */

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 20px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: border-color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value {
  font-family: "DM Mono", monospace;
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  padding: 2px 7px;
}

.stat-trend-up {
  color: var(--green);
  background: var(--green-bg);
}

.stat-trend-down {
  color: var(--red);
  background: var(--red-bg);
}

/* ═══════════════════════════════════════════════════════════════
   TOP BAR / HEADER
   ═══════════════════════════════════════════════════════════════ */

.topbar {
  position: sticky;
  top: 0;
  height: 56px;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  z-index: 50;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
}

/* ═══════════════════════════════════════════════════════════════
   DIVIDERS & SEPARATORS
   ═══════════════════════════════════════════════════════════════ */

.divider {
  height: 1px;
  background: var(--border);
  width: 100%;
}

.divider-v {
  width: 1px;
  background: var(--border);
  align-self: stretch;
}

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATION BADGE
   ═══════════════════════════════════════════════════════════════ */

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--red);
  position: absolute;
  top: 4px;
  right: 4px;
  border: 2px solid var(--bg-base);
  animation: pulseDot 2s ease infinite;
}

@keyframes pulseDot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(225, 112, 85, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(225, 112, 85, 0); }
}

.badge-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 99px;
  background: var(--red);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

/* ═══════════════════════════════════════════════════════════════
   FILTER TABS
   ═══════════════════════════════════════════════════════════════ */

.filter-tabs {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 4px;
  overflow-x: auto;
  flex-wrap: nowrap;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}

.filter-tab:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}

.filter-tab.active {
  background: var(--bg-elevated);
  color: var(--text-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.filter-tab .tab-count {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  border-radius: 99px;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  min-width: 20px;
  text-align: center;
}

.filter-tab.active .tab-count {
  background: var(--accent-glow);
  color: var(--accent-light);
}

/* ═══════════════════════════════════════════════════════════════
   SEARCH INPUT
   ═══════════════════════════════════════════════════════════════ */

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  pointer-events: none;
  width: 15px;
  height: 15px;
}

.search-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 8px 12px 8px 36px;
  font-size: 13px;
  font-family: "DM Sans", sans-serif;
  color: var(--text-primary);
  outline: none;
  width: 100%;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: rgba(108, 92, 231, 0.5);
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.08);
}

/* ═══════════════════════════════════════════════════════════════
   RECHARTS OVERRIDES
   ═══════════════════════════════════════════════════════════════ */

.recharts-tooltip-wrapper .recharts-default-tooltip {
  background: var(--bg-elevated) !important;
  border: 1px solid var(--border-hover) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-card) !important;
}

.recharts-tooltip-label {
  color: var(--text-secondary) !important;
  font-family: "DM Sans", sans-serif !important;
  font-size: 12px !important;
}

.recharts-tooltip-item {
  color: var(--text-primary) !important;
  font-family: "DM Mono", monospace !important;
  font-size: 13px !important;
}

.recharts-cartesian-axis-tick-value {
  fill: var(--text-muted) !important;
  font-family: "DM Sans", sans-serif !important;
  font-size: 11px !important;
}

/* ═══════════════════════════════════════════════════════════════
   UTILITY CLASSES
   ═══════════════════════════════════════════════════════════════ */

.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.gap-6 { gap: 24px; }
.gap-7 { gap: 28px; }
.flex-1 { flex: 1; }
.flex-wrap { flex-wrap: wrap; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.relative { position: relative; }
.overflow-hidden { overflow: hidden; }
.overflow-auto { overflow: auto; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.cursor-pointer { cursor: pointer; }

.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
  .hide-mobile { display: none !important; }
}

@media (min-width: 641px) {
  .show-mobile-only { display: none !important; }
}

/* ═══════════════════════════════════════════════════════════════
   SONNER TOAST OVERRIDES
   ═══════════════════════════════════════════════════════════════ */

[data-sonner-toaster] {
  font-family: "DM Sans", sans-serif !important;
}

[data-sonner-toast] {
  background: var(--bg-elevated) !important;
  border: 1px solid var(--border-hover) !important;
  border-radius: var(--radius-md) !important;
  color: var(--text-primary) !important;
  font-size: 13px !important;
  box-shadow: var(--shadow-modal) !important;
}

[data-sonner-toast][data-type="success"] {
  border-color: var(--green-border) !important;
}

[data-sonner-toast][data-type="error"] {
  border-color: var(--red-border) !important;
}

/* ═══════════════════════════════════════════════════════════════
   PRINT STYLES
   ═══════════════════════════════════════════════════════════════ */

@media print {
  .sidebar, .topbar, .btn, .modal-backdrop {
    display: none !important;
  }

  body {
    background: white !important;
    color: black !important;
  }
}
'''
import os
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "w") as f:
    f.write(content)
print("Written:", path)
PYEOF
