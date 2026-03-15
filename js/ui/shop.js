import { getState } from '../state.js';
import { SHOP_ITEMS, SHOP_CATEGORIES } from '../data/shop-items.js';
import { purchaseItem, equipItem, unequipItem, isItemOwned, isItemEquipped, getLevel } from '../engagement.js';
import { spawnCoins } from '../animations.js';

let activeCategory = 'themes';

export function renderShop(container) {
  const state = getState();
  const level = getLevel(state.xp);
  const progress = level.nextLevel
    ? Math.round(((state.xp - level.xp) / (level.nextLevel.xp - level.xp)) * 100)
    : 100;

  container.innerHTML = `
    <div class="flex flex-col gap-5 pb-4">
      <!-- XP Balance Card -->
      <div class="card p-5 text-center bg-gradient-to-br from-[var(--surface)] to-[var(--surface2)]">
        <div class="text-3xl font-extrabold text-gold">${state.xp} XP</div>
        <div class="text-sm text-txt2 mt-1">${level.name}${level.nextLevel ? ` \u2022 ${level.nextLevel.xp - state.xp} XP to ${level.nextLevel.name}` : ''}</div>
        <div class="w-full h-2 bg-surface2 rounded-full mt-3 overflow-hidden">
          <div class="h-full bg-gold rounded-full transition-all" style="width: ${progress}%"></div>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" id="shop-tabs">
        ${SHOP_CATEGORIES.map(cat => `
          <button class="shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all
            ${cat.id === activeCategory ? 'bg-accent text-white shadow-card' : 'bg-surface2 text-txt2'}"
            data-category="${cat.id}">
            ${cat.icon} ${cat.name}
          </button>
        `).join('')}
      </div>

      <!-- Items Grid -->
      <div class="grid grid-cols-2 gap-3" id="shop-items">
        ${renderItems(activeCategory)}
      </div>
    </div>

    <!-- Purchase Confirmation -->
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn" id="shop-confirm" style="display:none">
      <div class="card p-6 w-[min(300px,85vw)] text-center animate-slideUp">
        <div class="text-lg font-bold mb-2" id="confirm-name"></div>
        <div class="text-2xl font-extrabold text-gold mb-4" id="confirm-price"></div>
        <div class="flex gap-3">
          <button class="flex-1 py-3 rounded-xl bg-surface2 text-txt font-semibold active:scale-95 transition-transform" id="confirm-cancel">Cancel</button>
          <button class="flex-1 py-3 rounded-xl bg-gold text-black font-bold active:scale-95 transition-transform" id="confirm-buy">Buy</button>
        </div>
      </div>
    </div>
  `;

  // Category tab clicks
  container.querySelector('#shop-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;
    activeCategory = btn.dataset.category;
    renderShop(container);
  });

  // Item clicks
  container.querySelector('#shop-items').addEventListener('click', (e) => {
    const card = e.target.closest('[data-item-id]');
    if (!card) return;
    const item = SHOP_ITEMS.find(i => i.id === card.dataset.itemId);
    if (!item) return;

    if (isItemOwned(item)) {
      // Toggle equip
      if (isItemEquipped(item)) {
        if (item.category !== 'themes') unequipItem(item.category);
      } else {
        equipItem(item);
      }
      renderShop(container);
    } else if (state.xp >= item.price) {
      // Show purchase confirmation
      showConfirm(container, item);
    }
  });
}

function renderItems(category) {
  const items = SHOP_ITEMS.filter(i => i.category === category);
  const state = getState();

  return items.map(item => {
    const owned = isItemOwned(item);
    const equipped = isItemEquipped(item);
    const canAfford = state.xp >= item.price;

    let preview = '';
    if (item.preview) {
      preview = `<div class="w-10 h-10 rounded-full mx-auto mb-2" style="background: ${item.preview}"></div>`;
    } else if (item.category === 'skins') {
      const icons = { 'skin-gradient': '\u{1F308}', 'skin-glass': '\u{1FA9F}', 'skin-neon-border': '\u{1F4A0}' };
      preview = `<div class="text-3xl mb-2">${icons[item.cssClass] || '\u{2728}'}</div>`;
    } else if (item.category === 'celebrations') {
      const icons = { stars: '\u{2B50}', hearts: '\u{1F496}', sparkle: '\u{2728}', rainbow: '\u{1F308}' };
      preview = `<div class="text-3xl mb-2">${icons[item.effectId] || '\u{1F389}'}</div>`;
    }

    let badge = '';
    if (equipped) {
      badge = '<div class="absolute top-2 right-2 w-6 h-6 rounded-full bg-green text-black text-xs font-bold flex items-center justify-center">\u2713</div>';
    } else if (owned) {
      badge = '<div class="absolute top-2 right-2 text-xs text-green font-semibold">Owned</div>';
    }

    return `
      <button class="card relative p-4 text-center transition-all active:scale-95
        ${equipped ? 'ring-2 ring-accent' : ''}
        ${!owned && !canAfford ? 'opacity-50' : ''}"
        data-item-id="${item.id}">
        ${badge}
        ${preview}
        <div class="font-semibold text-sm">${item.name}</div>
        ${!owned ? `<div class="text-xs font-bold text-gold mt-1">${item.price} XP</div>` : ''}
        ${owned && !equipped ? '<div class="text-xs text-txt2 mt-1">Tap to equip</div>' : ''}
        ${equipped ? '<div class="text-xs text-accent mt-1">Equipped</div>' : ''}
      </button>
    `;
  }).join('');
}

function showConfirm(container, item) {
  const modal = container.querySelector('#shop-confirm');
  modal.querySelector('#confirm-name').textContent = item.name;
  modal.querySelector('#confirm-price').textContent = `${item.price} XP`;
  modal.style.display = 'flex';

  const cancel = modal.querySelector('#confirm-cancel');
  const buy = modal.querySelector('#confirm-buy');

  const cleanup = () => {
    modal.style.display = 'none';
    cancel.replaceWith(cancel.cloneNode(true));
    buy.replaceWith(buy.cloneNode(true));
  };

  cancel.addEventListener('click', cleanup, { once: true });

  buy.addEventListener('click', () => {
    const result = purchaseItem(item);
    if (result.success) {
      spawnCoins(10);
      equipItem(item);
    }
    cleanup();
    renderShop(container);
  }, { once: true });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) cleanup();
  }, { once: true });
}
