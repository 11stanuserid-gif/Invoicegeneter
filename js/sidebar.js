import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { showToast } from './utils.js';

export function renderSidebar(activePage = 'dashboard') {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home', href: 'dashboard.html' },
    { id: 'invoice', label: 'Invoice', icon: 'file-text', href: 'invoice-list.html' },
    { id: 'statement', label: 'Statement', icon: 'list', href: 'statement.html' },
    { id: 'company', label: 'Company Details', icon: 'briefcase', href: 'company-details.html' },
    { id: 'backup', label: 'Backup Management', icon: 'cloud', href: 'backup.html' },
    { id: 'help', label: 'Help/Support', icon: 'help-circle', href: 'help.html' },
    { id: 'logout', label: 'Logout', icon: 'log-out', href: '#', logout: true }
  ];

  const navHtml = items.map(item => `
    <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}" ${item.logout ? 'data-logout="true"' : ''}>
      <i data-feather="${item.icon}"></i>
      <span class="nav-text">${item.label}</span>
    </a>
  `).join('');

  return `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon"><i data-feather="file-text"></i></div>
        <div class="sidebar-logo-text">INVOICE<br>MANAGEMENT</div>
      </div>
      <nav>${navHtml}</nav>
      <button class="collapse-btn"><i data-feather="chevrons-left"></i> <span class="nav-text">Collapse</span></button>
    </aside>
  `;
}

export function renderTopbar(userName = 'User') {
  return `
    <div class="topbar">
      <div class="topbar-left">
        <button class="menu-toggle"><i data-feather="menu"></i></button>
      </div>
      <div class="topbar-right">
        <a href="profile.html" class="user-menu">
          <div class="user-avatar">${userName.charAt(0).toUpperCase()}</div>
          <span>Hi, ${userName}</span>
          <i data-feather="chevron-down"></i>
        </a>
        <a href="invoice-setting.html" class="icon-btn"><i data-feather="settings"></i></a>
      </div>
    </div>
  `;
}

export function attachLogout() {
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        await signOut(auth);
        showToast('Logged out successfully');
        setTimeout(() => window.location.href = 'login.html', 800);
      }
    });
  });
}
