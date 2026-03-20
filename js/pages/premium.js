Pages.premium = async function () {
  App.setPage('premium');

  App.render(`
    <div class="premium-page">
      <div class="premium-hero">
        <h1>Pilih Paket <span>Kamu</span></h1>
        <p>Nikmati konten tanpa batas dengan paket yang sesuai kebutuhan.</p>
      </div>

      <div class="plans-grid">
        ${CONFIG.PLANS.map(plan => `
          <div class="plan-card ${plan.popular ? 'popular' : ''}" data-plan="${plan.id}">
            ${plan.popular ? '<span class="plan-popular-badge">Paling Populer</span>' : ''}
            <div class="plan-header">
              <h3 class="plan-name" style="color: ${plan.color}">${plan.name}</h3>
              <div class="plan-price">
                ${plan.price === 0
                  ? '<span class="price-free">Gratis</span>'
                  : `<span class="price-amount">Rp ${plan.price.toLocaleString('id-ID')}</span><span class="price-period">/bulan</span>`
                }
              </div>
            </div>
            <ul class="plan-benefits">
              ${plan.benefits.map(b => `
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${plan.color}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ${b}
                </li>
              `).join('')}
            </ul>
            <button class="plan-btn ${plan.id === 'free' ? 'plan-btn-free' : ''}" style="--color: ${plan.color}" data-plan="${plan.id}">
              ${plan.id === 'free' ? 'Pakai Gratis' : `Pilih ${plan.name}`}
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Payment Modal -->
      <div class="payment-modal" id="paymentModal">
        <div class="payment-box">
          <button class="payment-close" id="paymentClose">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <div id="payment-content"></div>
        </div>
      </div>
    </div>
  `);

  // Handle plan buttons
  document.querySelectorAll('.plan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const planId = btn.dataset.plan;
      const plan = CONFIG.PLANS.find(p => p.id === planId);
      if (!plan || plan.id === 'free') {
        alert('Kamu sekarang menggunakan paket Gratis.');
        return;
      }
      openPayment(plan);
    });
  });

  document.getElementById('paymentClose').addEventListener('click', () => {
    document.getElementById('paymentModal').classList.remove('open');
  });
};

function openPayment(plan) {
  const modal = document.getElementById('paymentModal');
  const content = document.getElementById('payment-content');

  content.innerHTML = `
    <h2 class="payment-title">Bayar Paket <span style="color:${plan.color}">${plan.name}</span></h2>
    <p class="payment-amount">Rp ${plan.price.toLocaleString('id-ID')} / bulan</p>

    <div class="payment-methods">
      <h4>Pilih Metode Pembayaran</h4>
      <div class="payment-grid">
        ${CONFIG.PAYMENT.map(method => `
          <button class="payment-method" data-method="${method.id}">
            <span class="method-icon">${method.icon}</span>
            <span>${method.label}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="payment-note">
      <p>Setelah memilih metode, kamu akan diarahkan ke halaman pembayaran.</p>
      <p>Pembayaran aman dan terenkripsi.</p>
    </div>

    <div id="payment-action"></div>
  `;

  modal.classList.add('open');

  document.querySelectorAll('.payment-method').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.payment-method').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      document.getElementById('payment-action').innerHTML = `
        <button class="btn-pay" style="background: ${plan.color}">
          Lanjut Pembayaran via ${btn.querySelector('span:last-child').textContent}
        </button>
        <p class="payment-disclaimer">Ini adalah demo. Tidak ada transaksi nyata.</p>
      `;

      document.querySelector('.btn-pay')?.addEventListener('click', () => {
        document.getElementById('payment-action').innerHTML = `
          <div class="payment-success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${plan.color}" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12" stroke-width="2.5"/></svg>
            <h3>Pembayaran Berhasil!</h3>
            <p>Paket ${plan.name} aktif. Selamat menikmati!</p>
          </div>
        `;
      });
    });
  });
}
