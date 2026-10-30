(function () {
  'use strict';

  // --- Constants ---
  const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

  const LS_KEYS = {
    transactions: 'expenseTransactions',
    categories: 'customCategories',
    theme: 'preferredTheme',
  };

  const CHART_PALETTE = ['#E8F5E9', '#A5D6A7', '#66BB6A', '#1B5E20', '#89A482'];

  // --- In-memory state ---
  let transactions = [];
  let customCategories = [];
  let chartInstance = null;
  let selectedMonth = null;
  let pendingDeleteId = null;

  // --- Toast helper ---
  function showToast(message) {
    let toast = document.getElementById('toast-message');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-message';
      toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:12px 24px;border-radius:8px;z-index:9999;font-size:0.9rem;max-width:90vw;text-align:center;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, 4000);
  }

  // --- StorageManager ---
  const StorageManager = {
    loadTransactions() {
      try {
        const raw = localStorage.getItem(LS_KEYS.transactions);
        if (raw === null) return [];
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    },
    saveTransactions(arr) {
      try {
        localStorage.setItem(LS_KEYS.transactions, JSON.stringify(arr));
      } catch (e) {
        showToast('Data could not be saved. Changes may be lost on refresh.');
      }
    },
    loadCustomCategories() {
      try {
        const raw = localStorage.getItem(LS_KEYS.categories);
        if (raw === null) return [];
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    },
    saveCustomCategories(arr) {
      try {
        localStorage.setItem(LS_KEYS.categories, JSON.stringify(arr));
      } catch (e) {
        showToast('Data could not be saved. Changes may be lost on refresh.');
      }
    },
    loadTheme() {
      return localStorage.getItem(LS_KEYS.theme);
    },
    saveTheme(theme) {
      localStorage.setItem(LS_KEYS.theme, theme);
    }
  };

  // --- Validator ---
  const Validator = {
    validateTransaction(name, amount) {
      const trimmedName = String(name).trim();
      if (trimmedName.length === 0) {
        return { ok: false, nameError: 'Item Name is required.' };
      }
      if (trimmedName.length > 100) {
        return { ok: false, nameError: 'Name must be 100 characters or fewer.' };
      }
      const numAmount = Number(amount);
      if (!Number.isInteger(numAmount) || numAmount < 1 || numAmount > 999999999) {
        return { ok: false, amountError: 'Please enter a valid positive amount (1–999,999,999).' };
      }
      return { ok: true };
    },

    validateCategory(name, existingCategories) {
      const trimmed = String(name).trim();
      if (trimmed.length === 0) {
        return { ok: false, error: 'Category name is required.' };
      }
      if (trimmed.length > 50) {
        return { ok: false, error: 'Category name must be 50 characters or fewer.' };
      }
      const lowerTrimmed = trimmed.toLowerCase();
      const isDuplicate = existingCategories.some(
        c => String(c).toLowerCase() === lowerTrimmed
      );
      if (isDuplicate) {
        return { ok: false, error: 'This category already exists.' };
      }
      return { ok: true };
    }
  };

  // --- Business Logic Utilities ---

  function calculateTotalSpending(txns) {
    return txns.reduce((sum, t) => sum + t.amount, 0);
  }

  function calculateCategoryTotals(txns) {
    const map = new Map();
    for (const t of txns) {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    }
    // Exclude categories with sum <= 0
    for (const [key, val] of map) {
      if (val <= 0) map.delete(key);
    }
    return map;
  }

  function formatIDR(amount) {
    // Format as Rp with dot-separated thousands (Indonesian format)
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  function formatDate(isoString) {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function assignPaletteColors(count) {
    return Array.from({ length: count }, (_, i) => CHART_PALETTE[i % CHART_PALETTE.length]);
  }

  // --- Renderers ---

  function renderTransactionList(txns) {
    const list = document.getElementById('transaction-list');
    if (!list) return;
    list.innerHTML = '';

    if (!txns || txns.length === 0) {
      list.innerHTML = '<li class="empty-state">No expenses recorded yet.</li>';
      return;
    }

    // Sort by date descending (newest first)
    const sorted = [...txns].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(t => {
      const li = document.createElement('li');
      li.dataset.id = t.id;
      li.innerHTML = `
        <span class="transaction-name" title="${t.name.replace(/"/g, '&quot;')}">${t.name}</span>
        <span class="transaction-amount">${formatIDR(t.amount)}</span>
        <span class="transaction-category">${t.category}</span>
        <span class="transaction-date">${formatDate(t.date)}</span>
        <button class="delete-btn" data-id="${t.id}" aria-label="Delete ${t.name}">Delete</button>
      `;
      list.appendChild(li);
    });

    // Delegated click listener — attach once if not already attached
    if (!list._deleteListenerAttached) {
      list.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-btn');
        if (btn) handleDeleteTransaction(btn.dataset.id);
      });
      list._deleteListenerAttached = true;
    }
  }

  function renderTotalSpending(total) {
    const el = document.getElementById('total-spending');
    if (el) el.textContent = formatIDR(total);
  }

  function renderCategoryDropdown(allCategories) {
    const select = document.getElementById('category');
    if (!select) return;
    select.innerHTML = '';
    allCategories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
    // Select the first DEFAULT_CATEGORY by default
    if (DEFAULT_CATEGORIES.length > 0) {
      select.value = DEFAULT_CATEGORIES[0];
    }
  }

  // --- Event Handlers ---

  function handleAddTransaction(event) {
    event.preventDefault();

    // Clear existing errors
    const nameErrorEl = document.getElementById('item-name-error');
    const amountErrorEl = document.getElementById('amount-error');
    const nameInput = document.getElementById('item-name');
    const amountInput = document.getElementById('amount');

    if (nameErrorEl) nameErrorEl.textContent = '';
    if (amountErrorEl) amountErrorEl.textContent = '';
    if (nameInput) nameInput.removeAttribute('aria-invalid');
    if (amountInput) amountInput.removeAttribute('aria-invalid');

    const name = nameInput ? nameInput.value : '';
    const amountVal = amountInput ? amountInput.value : '';

    const result = Validator.validateTransaction(name, amountVal);

    if (!result.ok) {
      if (result.nameError) {
        if (nameErrorEl) nameErrorEl.textContent = result.nameError;
        if (nameInput) nameInput.setAttribute('aria-invalid', 'true');
      }
      if (result.amountError) {
        if (amountErrorEl) amountErrorEl.textContent = result.amountError;
        if (amountInput) amountInput.setAttribute('aria-invalid', 'true');
      }
      return;
    }

    // Create new transaction
    const categorySelect = document.getElementById('category');
    const selectedCategory = categorySelect ? categorySelect.value : DEFAULT_CATEGORIES[0];

    const newTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      amount: parseInt(amountVal, 10),
      category: selectedCategory,
      date: new Date().toISOString()
    };

    transactions.push(newTransaction);
    StorageManager.saveTransactions(transactions);
    updateDashboard();

    // Reset form
    if (nameInput) nameInput.value = '';
    if (amountInput) amountInput.value = '';
    if (categorySelect) categorySelect.value = DEFAULT_CATEGORIES[0];
    if (nameErrorEl) nameErrorEl.textContent = '';
    if (amountErrorEl) amountErrorEl.textContent = '';
    if (nameInput) nameInput.removeAttribute('aria-invalid');
    if (amountInput) amountInput.removeAttribute('aria-invalid');
  }

  // --- Orchestration ---
  function updateDashboard() {
    renderTransactionList(transactions);
    renderTotalSpending(calculateTotalSpending(transactions));
    if (typeof ChartManager !== 'undefined') {
      ChartManager.update(calculateCategoryTotals(transactions));
    }
    const monthlyGroups = getMonthlyGroups(transactions);
    renderMonthlySummary(monthlyGroups, selectedMonth);
  }

  // --- Delete Modal Handlers ---

  // Shows the delete confirmation modal and stores the id of the transaction
  // pending deletion.
  function handleDeleteTransaction(id) {
    pendingDeleteId = id;
    const modal = document.getElementById('delete-modal');
    if (modal) modal.style.display = 'flex';
  }

  function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) modal.style.display = 'none';
    pendingDeleteId = null;
  }

  function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    const idx = transactions.findIndex(t => t.id === id);
    if (idx === -1) { closeDeleteModal(); return; }

    const removed = transactions.splice(idx, 1)[0];

    try {
      StorageManager.saveTransactions(transactions);
      updateDashboard();
      closeDeleteModal();
    } catch (e) {
      // Re-insert at original index on failure
      transactions.splice(idx, 0, removed);
      renderTransactionList(transactions);
      showToast('Deletion could not be completed. Please try again.');
      closeDeleteModal();
    }
  }

  // --- ChartManager ---
  const ChartManager = {
    init(canvasId, categoryTotalsMap, isDark) {
      if (typeof Chart === 'undefined') {
        const container = document.getElementById('chart-container');
        if (container) {
          container.innerHTML = '<p style="color:var(--color-error);text-align:center;">Chart could not be loaded. Please check your internet connection.</p>';
        }
        return;
      }

      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      // Destroy existing instance
      ChartManager.destroy();

      const emptyMsg = document.getElementById('chart-empty-message');
      const container = document.getElementById('chart-container');

      if (!categoryTotalsMap || categoryTotalsMap.size === 0) {
        if (container) container.style.display = 'none';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
      }

      if (container) container.style.display = 'block';
      if (emptyMsg) emptyMsg.style.display = 'none';

      const labels = [...categoryTotalsMap.keys()];
      const data = [...categoryTotalsMap.values()];
      const colors = assignPaletteColors(labels.length);

      chartInstance = new Chart(canvas, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: isDark ? '#1E1E1E' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Spending Distribution by Category',
              color: isDark ? '#E8F5E9' : '#1B5E20',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              labels: { color: isDark ? '#E8F5E9' : '#1B1B1B' }
            }
          }
        }
      });
    },

    update(categoryTotalsMap) {
      const emptyMsg = document.getElementById('chart-empty-message');
      const container = document.getElementById('chart-container');

      if (!categoryTotalsMap || categoryTotalsMap.size === 0) {
        ChartManager.destroy();
        if (container) container.style.display = 'none';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
      }

      if (container) container.style.display = 'block';
      if (emptyMsg) emptyMsg.style.display = 'none';

      const labels = [...categoryTotalsMap.keys()];
      const data = [...categoryTotalsMap.values()];
      const colors = assignPaletteColors(labels.length);

      if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = data;
        chartInstance.data.datasets[0].backgroundColor = colors;
        chartInstance.update();
      } else {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ChartManager.init('spending-chart', categoryTotalsMap, isDark);
      }
    },

    updateTheme(isDark) {
      if (!chartInstance) return;
      chartInstance.options.plugins.title.color = isDark ? '#E8F5E9' : '#1B5E20';
      chartInstance.options.plugins.legend.labels.color = isDark ? '#E8F5E9' : '#1B1B1B';
      chartInstance.data.datasets[0].borderColor = isDark ? '#1E1E1E' : '#FFFFFF';
      chartInstance.update();
    },

    destroy() {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
    }
  };

  // --- Bootstrap ---

  // Stubs for functions not yet implemented — will be replaced in tasks 9, 10, 11
  function handleAddCategory(event) {
    event.preventDefault();
    const input = document.getElementById('new-category-name');
    const errorEl = document.getElementById('category-error');
    const name = input ? input.value : '';

    if (errorEl) errorEl.textContent = '';

    const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];
    const result = Validator.validateCategory(name, allCategories);

    if (!result.ok) {
      if (errorEl) errorEl.textContent = result.error;
      return;
    }

    customCategories.push(name.trim());
    StorageManager.saveCustomCategories(customCategories);
    renderCategoryDropdown([...DEFAULT_CATEGORIES, ...customCategories]);
    renderCategoryManager(customCategories);
    if (input) input.value = '';
    if (errorEl) errorEl.textContent = '';
  }

  function handleDeleteCategory(name) {
    const categoryErrorEl = document.getElementById('category-error');

    if (DEFAULT_CATEGORIES.includes(name)) {
      if (categoryErrorEl) categoryErrorEl.textContent = 'Default categories cannot be removed.';
      return;
    }

    const isInUse = transactions.some(t => t.category === name);
    if (isInUse) {
      if (categoryErrorEl) categoryErrorEl.textContent = 'Category is in use and cannot be deleted.';
      return;
    }

    customCategories = customCategories.filter(c => c !== name);
    StorageManager.saveCustomCategories(customCategories);
    renderCategoryDropdown([...DEFAULT_CATEGORIES, ...customCategories]);
    renderCategoryManager(customCategories);
    if (categoryErrorEl) categoryErrorEl.textContent = '';
  }
  function handleThemeToggle() {}
  function handleMonthChange(monthKey) {
    selectedMonth = monthKey;
    renderMonthlySummary(getMonthlyGroups(transactions), selectedMonth);
  }
  function renderCategoryManager(cats) {
    const list = document.getElementById('category-list');
    if (!list) return;
    list.innerHTML = '';

    // Show default categories (non-deletable)
    DEFAULT_CATEGORIES.forEach(cat => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${cat}</span><span class="category-default-badge" style="font-size:0.75rem;color:var(--color-text-muted);">(default)</span>`;
      list.appendChild(li);
    });

    // Show custom categories (deletable)
    cats.forEach(cat => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${cat}</span>
        <button class="delete-category-btn" data-name="${cat}" aria-label="Delete category ${cat}">Delete</button>
      `;
      list.appendChild(li);
    });

    // Delegated click listener — attach once
    if (!list._categoryDeleteListenerAttached) {
      list.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-category-btn');
        if (btn) handleDeleteCategory(btn.dataset.name);
      });
      list._categoryDeleteListenerAttached = true;
    }
  }
  function getMonthlyGroups(txns) {
    const map = new Map();
    for (const t of txns) {
      const d = new Date(t.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    }
    return map;
  }

  function getMonthlySummaryStats(txns) {
    const total = txns.reduce((sum, t) => sum + t.amount, 0);
    const count = txns.length;

    // Build category totals
    const catTotals = {};
    for (const t of txns) {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    }

    // Top category with alphabetical tiebreak
    let topCategory = null;
    if (Object.keys(catTotals).length > 0) {
      const sorted = Object.entries(catTotals).sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1]; // descending by total
        return a[0].localeCompare(b[0]);         // alphabetical tiebreak
      });
      topCategory = sorted[0][0];
    }

    // Breakdown sorted descending
    const breakdown = Object.entries(catTotals)
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })
      .map(([category, total]) => ({ category, total }));

    return { total, count, topCategory, breakdown };
  }

  function renderMonthlySummary(monthlyGroups, selectedKey) {
    const selector = document.getElementById('month-selector');
    const statsEl = document.getElementById('monthly-stats');
    const breakdownEl = document.getElementById('monthly-breakdown');

    if (!selector || !statsEl || !breakdownEl) return;

    // Populate month selector — sorted descending
    const keys = [...monthlyGroups.keys()].sort().reverse();
    selector.innerHTML = '';
    if (keys.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No data';
      selector.appendChild(option);
      statsEl.innerHTML = '<p class="empty-state">No expenses recorded yet.</p>';
      breakdownEl.innerHTML = '';
      return;
    }

    keys.forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      // Format key "YYYY-MM" as "Month YYYY"
      const [year, monthNum] = key.split('-');
      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
        .toLocaleString('default', { month: 'long' });
      option.textContent = `${monthName} ${year}`;
      selector.appendChild(option);
    });

    // Select the active key (default to first/most recent)
    const activeKey = selectedKey && keys.includes(selectedKey) ? selectedKey : keys[0];
    selector.value = activeKey;

    const txns = monthlyGroups.get(activeKey) || [];
    if (txns.length === 0) {
      statsEl.innerHTML = '<p class="empty-state">No data for this period.</p>';
      breakdownEl.innerHTML = '';
      return;
    }

    const stats = getMonthlySummaryStats(txns);
    statsEl.innerHTML = `
      <p><strong>Total:</strong> ${formatIDR(stats.total)}</p>
      <p><strong>Transactions:</strong> ${stats.count}</p>
      <p><strong>Top Category:</strong> ${stats.topCategory || 'N/A'}</p>
    `;

    breakdownEl.innerHTML = '';
    stats.breakdown.forEach(({ category, total }) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${category}</span><span>${formatIDR(total)}</span>`;
      li.style.cssText = 'display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--color-border);';
      breakdownEl.appendChild(li);
    });
  }

  function init() {
    // 1. Apply saved theme before first paint (prevents flash)
    const savedTheme = StorageManager.loadTheme();
    const isDark = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme || 'light');

    // 2. Update theme toggle button label
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    // 3. Load data from localStorage
    transactions = StorageManager.loadTransactions();
    customCategories = StorageManager.loadCustomCategories();

    // 4. Set selectedMonth to the most recent month with transactions
    const monthlyGroups = getMonthlyGroups(transactions);
    if (monthlyGroups.size > 0) {
      const keys = [...monthlyGroups.keys()].sort().reverse();
      selectedMonth = keys[0];
    } else {
      selectedMonth = null;
    }

    // 5. Render category dropdown
    renderCategoryDropdown([...DEFAULT_CATEGORIES, ...customCategories]);

    // 6. Initialize chart
    if (typeof ChartManager !== 'undefined') {
      ChartManager.init('spending-chart', calculateCategoryTotals(transactions), isDark);
    }

    // 7. Initial dashboard render
    updateDashboard();

    // 8. Render category manager
    if (typeof renderCategoryManager === 'function') {
      renderCategoryManager(customCategories);
    }

    // 9. Attach all event listeners
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) expenseForm.addEventListener('submit', handleAddTransaction);

    const customCategoryForm = document.getElementById('custom-category-form');
    if (customCategoryForm) customCategoryForm.addEventListener('submit', handleAddCategory);

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', handleThemeToggle);

    const monthSelector = document.getElementById('month-selector');
    if (monthSelector) monthSelector.addEventListener('change', (e) => handleMonthChange(e.target.value));

    const confirmBtn = document.getElementById('modal-confirm-btn');
    if (confirmBtn) confirmBtn.addEventListener('click', handleConfirmDelete);

    const cancelBtn = document.getElementById('modal-cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeDeleteModal);
  }

  document.addEventListener('DOMContentLoaded', init);

})();
