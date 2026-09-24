/* ==========================================================================
   SILENT BEATS - CUSTOMER DASHBOARD JAVASCRIPT
   Handles: Dashboard Tab Navigation, Reservation Tracker, New Booking Modal,
            Invoice Generation & Payment Status Management
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Dashboard Mobile Drawer Toggle (<= 1024px)
  const dashHamburgerBtn = document.getElementById('dashHamburgerBtn');
  const dashDrawerCloseBtn = document.getElementById('dashDrawerCloseBtn');
  const dashDrawerOverlay = document.getElementById('dashDrawerOverlay');
  const dashSidebar = document.getElementById('dashSidebar');

  function openDashDrawer() {
    if (dashSidebar && dashDrawerOverlay) {
      dashSidebar.classList.add('active');
      dashDrawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDashDrawer() {
    if (dashSidebar && dashDrawerOverlay) {
      dashSidebar.classList.remove('active');
      dashDrawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (dashHamburgerBtn) dashHamburgerBtn.addEventListener('click', openDashDrawer);
  if (dashDrawerCloseBtn) dashDrawerCloseBtn.addEventListener('click', closeDashDrawer);
  if (dashDrawerOverlay) dashDrawerOverlay.addEventListener('click', closeDashDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDashDrawer();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      closeDashDrawer();
    }
  });

  // Tab Navigation
  const menuItems = document.querySelectorAll('.dash-menu-item[data-tab]');
  const tabPanes = document.querySelectorAll('.dash-tab-pane');

  if (menuItems.length > 0) {
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');

        menuItems.forEach(m => m.classList.remove('active'));
        tabPanes.forEach(pane => pane.style.display = 'none');

        item.classList.add('active');
        const activePane = document.getElementById(`tab-${targetTab}`);
        if (activePane) {
          activePane.style.display = 'block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Auto-close drawer on mobile / tablet after switching tab
        if (window.innerWidth <= 1024) {
          closeDashDrawer();
        }
      });
    });
  }

  // New Reservation Modal Logic
  const newBookingBtn = document.getElementById('btnNewBooking');
  const bookingModal = document.getElementById('bookingModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const newBookingForm = document.getElementById('newBookingForm');
  const modalGuestCount = document.getElementById('modalGuestCount');
  const modalTotalPrice = document.getElementById('modalTotalPrice');

  function openBookingModal() {
    if (bookingModal) bookingModal.style.display = 'flex';
  }

  function closeBookingModal() {
    if (bookingModal) bookingModal.style.display = 'none';
  }

  if (newBookingBtn) newBookingBtn.addEventListener('click', openBookingModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeBookingModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeBookingModal);

  if (modalGuestCount && modalTotalPrice) {
    function updateModalPrice() {
      const count = parseInt(modalGuestCount.value, 10) || 50;
      let price = count * 6.0 + 80;
      modalTotalPrice.textContent = `$${price.toFixed(2)}`;
    }
    modalGuestCount.addEventListener('input', updateModalPrice);
  }

  if (newBookingForm) {
    newBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeBookingModal();
      if (window.showToast) {
        window.showToast('Reservation created successfully! Your order is now Confirmed. 🎉');
      }
      // Add row to table dynamically
      const tableBody = document.querySelector('#reservationsTable tbody');
      if (tableBody) {
        const row = document.createElement('tr');
        const orderId = '#SB-' + Math.floor(10000 + Math.random() * 90000);
        const eventDate = document.getElementById('modalEventDate')?.value || '2026-10-15';
        const headsets = modalGuestCount ? modalGuestCount.value : '50';
        row.innerHTML = `
          <td class="col-ref"><strong>${orderId}</strong></td>
          <td class="col-date">${eventDate}</td>
          <td class="col-details">${headsets} LED Headsets (3-Ch)</td>
          <td class="col-status"><span class="status-badge status-confirmed"><i data-lucide="check-circle"></i> Confirmed</span></td>
          <td class="col-total"><strong>${modalTotalPrice?.textContent || '$380.00'}</strong></td>
          <td class="col-action"><button class="btn btn-outline btn-sm" onclick="alert('Downloading invoice for ${orderId}...')">Invoice</button></td>
        `;
        tableBody.prepend(row);
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Countdown to Next Event
  const countdownTimer = document.getElementById('eventCountdown');
  if (countdownTimer) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownTimer.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();
  }
});
