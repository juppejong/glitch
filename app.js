async function loadProducts() {
  const grid = document.getElementById('product-grid');
  try {
    const res = await fetch('products.json', { cache: 'no-store' });
    const products = await res.json();
    if (!Array.isArray(products) || !products.length) {
      grid.innerHTML = '<p class="grid-empty">Nieuwe ontwerpen komen eraan.</p>';
      return;
    }
    grid.innerHTML = products.map(renderCard).join('');
  } catch (e) {
    grid.innerHTML = '<p class="grid-empty">De productlijst kon niet geladen worden.</p>';
  }
}

function renderCard(p) {
  const price = p.priceMin === p.priceMax
    ? `€${p.priceMin.toFixed(2)}`
    : `€${p.priceMin.toFixed(2)}–${p.priceMax.toFixed(2)}`;
  return `
    <article class="card">
      <div class="thumb"><img src="${p.image}" alt="${escapeHtml(p.title)}" loading="lazy" /></div>
      <div class="body">
        <span class="kind">${escapeHtml(p.kind)}</span>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.blurb)}</p>
        <div class="row">
          <span class="price">${price}</span>
          <a class="link" href="https://www.etsy.com/shop/Dataybytes" target="_blank" rel="noopener">View on Etsy →</a>
        </div>
      </div>
    </article>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

document.getElementById('year').textContent = new Date().getFullYear();
loadProducts();
