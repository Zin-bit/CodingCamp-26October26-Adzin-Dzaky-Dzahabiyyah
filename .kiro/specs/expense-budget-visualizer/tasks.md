# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a client-side-only single-page web application using HTML5, CSS3, and vanilla JavaScript. The app tracks expenses, organizes them by category, and visualizes spending with a Chart.js pie chart. All data is persisted in `localStorage`. No build step, no frameworks — the project deploys directly to GitHub Pages.

Implementation follows eight phases: project setup → UI → core functionality → localStorage → chart integration → optional features → testing & refinement → documentation.

## Tasks

- [x] 1. Set up project structure and HTML shell
  - Create the folder structure: `expense-budget-visualizer/`, `css/`, `js/`
  - Create `index.html` with a valid HTML5 doctype, `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, and the `<title>Expense & Budget Visualizer</title>` element
  - Add `<link rel="stylesheet" href="css/style.css">` inside `<head>`
  - Add Chart.js CDN `<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>` before `js/script.js`
  - Add `<script src="js/script.js" defer></script>` as the last script tag
  - Create empty `css/style.css` and `js/script.js` files
  - Create an empty `README.md`
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 1.1 Create semantic HTML structure in `index.html`
    - Add `<header class="app-header">` containing `<h1>` app title and `<button id="theme-toggle">` with `aria-label="Switch to dark mode"`
    - Add `<main>` containing a `<div class="main-grid">` wrapper
    - Inside `.main-grid` left column: `<div id="total-spending-card">`, `<section id="form-section">` with `<form id="expense-form" novalidate>`, and `<section id="category-section">` with `<form id="custom-category-form">` and `<ul id="category-list">`
    - Inside `.main-grid` right column: `<section id="list-section">` with `<ul id="transaction-list">`, `<section id="chart-section">` with `<div id="chart-container">` wrapping `<canvas id="spending-chart">` and a `<p id="chart-empty-message">`, and `<section id="monthly-section">` with `<select id="month-selector">`, `<div id="monthly-stats">`, and `<ul id="monthly-breakdown">`
    - Add `<div id="delete-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">` at the end of `<body>` for the deletion confirmation dialog
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.5, 3.1, 4.1, 5.1, 6.2, 6.4, 7.2, 9.3, 9.4_

  - [x] 1.2 Build the expense input form fields in `index.html`
    - Inside `#expense-form`: add `<label for="item-name">Item Name</label>`, `<input type="text" id="item-name" maxlength="100" required>`, `<span id="item-name-error" aria-live="polite" class="error-msg"></span>`
    - Add `<label for="amount">Amount (Rp)</label>`, `<input type="number" id="amount" min="1" max="999999999" required>`, `<span id="amount-error" aria-live="polite" class="error-msg"></span>`
    - Add `<label for="category">Category</label>`, `<select id="category"></select>`
    - Add `<button type="submit" id="add-btn">Add Transaction</button>`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.3 Build the custom category form in `index.html`
    - Inside `#custom-category-form`: add `<label for="new-category-name">New Category</label>`, `<input type="text" id="new-category-name" maxlength="50">`, `<span id="category-error" aria-live="polite" class="error-msg"></span>`, and `<button type="submit">Add Category</button>`
    - Below the form add the `<ul id="category-list">` with an empty `<li>` template comment for the delete buttons that will be rendered by JS
    - _Requirements: 5.1, 5.3, 5.8_

- [x] 2. Implement base CSS layout and design tokens in `css/style.css`
  - [x] 2.1 Define CSS custom properties (design tokens) and reset
    - Declare all `:root` custom properties: `--color-bg`, `--color-surface`, `--color-primary`, `--color-primary-dark`, `--color-secondary`, `--color-accent`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-error`, spacing scale (`--space-xs` through `--space-xl`), typography (`--font-family`, `--font-size-sm` through `--font-size-xl`), and border radii (`--radius-sm`, `--radius-md`, `--radius-lg`)
    - Declare `[data-theme="dark"]` overrides for all color tokens with the dark palette values
    - Add a minimal box-sizing reset: `*, *::before, *::after { box-sizing: border-box; }`
    - Set `body { font-family: var(--font-family); background: var(--color-bg); color: var(--color-text); margin: 0; }`
    - _Requirements: 7.4, 7.5, 9.1_

  - [x] 2.2 Implement two-column desktop layout and single-column mobile layout
    - Style `.main-grid` with `display: grid; grid-template-columns: minmax(30%, 400px) 1fr; gap: var(--space-lg);`
    - Add `min-width: 0` to all direct grid children to prevent overflow
    - Add `@media (max-width: 767px) { .main-grid { grid-template-columns: 1fr; } }` to collapse to single column
    - Style `body { overflow-x: hidden; }` and `#transaction-list { overflow-y: auto; max-height: 400px; }`
    - Ensure all container widths use `%`, `fr`, or `clamp()` — no fixed pixel widths on layout containers
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 2.3 Style the header, cards, form controls, and buttons
    - Style `.app-header` with `background: var(--color-primary); color: white; padding: var(--space-md)` and flex layout to space title and theme toggle
    - Style form `<input>`, `<select>` fields with `border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: var(--space-sm); width: 100%; background: var(--color-surface); color: var(--color-text)`
    - Style `#add-btn` and category submit button with `background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); padding: var(--space-sm) var(--space-md); cursor: pointer; width: 100%`
    - Style `.error-msg` with `color: var(--color-error); font-size: var(--font-size-sm); display: block; min-height: 1.2em`
    - Style card/surface sections with `background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-lg); margin-bottom: var(--space-md)`
    - _Requirements: 4.4, 7.4, 7.5, 9.1_

  - [x] 2.4 Style the transaction list items, delete modal, and total spending display
    - Style `#transaction-list li` with flex layout showing name (bold, truncated with `text-overflow: ellipsis`), amount badge (green), category label, date, and delete button
    - Style `#total-spending-card` prominently: large `var(--font-size-xl)` amount in `var(--color-primary-dark)`, label "Total Spending"
    - Style `#delete-modal` as a centered overlay with `position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5)` when visible, `display: none` when hidden
    - Style the modal inner box with confirm and cancel buttons
    - Add `#chart-container { max-width: 400px; margin: 0 auto; }` and `#chart-empty-message { text-align: center; color: var(--color-text-muted); }`
    - _Requirements: 2.1, 2.4, 2.5, 3.1, 3.2_

- [x] 3. Implement constants, state, StorageManager, and Validator in `js/script.js`
  - [x] 3.1 Define module-level constants and in-memory state
    - Wrap the entire file in an IIFE: `(function() { 'use strict'; ... })();`
    - Declare `const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];`
    - Declare `const LS_KEYS = { transactions: 'expenseTransactions', categories: 'customCategories', theme: 'preferredTheme' };`
    - Declare `const CHART_PALETTE = ['#E8F5E9', '#A5D6A7', '#66BB6A', '#1B5E20', '#89A482'];`
    - Declare mutable state: `let transactions = []; let customCategories = []; let chartInstance = null; let selectedMonth = null;`
    - _Requirements: 4.4, 4.8, 8.1, 8.2, 8.3, 10.1_

  - [x] 3.2 Implement `StorageManager` object
    - Implement `StorageManager.loadTransactions()`: wraps `JSON.parse(localStorage.getItem(LS_KEYS.transactions))` in try/catch; returns parsed array on success, `[]` on `SyntaxError` or missing key
    - Implement `StorageManager.saveTransactions(arr)`: wraps `localStorage.setItem(LS_KEYS.transactions, JSON.stringify(arr))` in try/catch; on exception, calls `showToast('Data could not be saved. Changes may be lost on refresh.')` — does NOT roll back in-memory state
    - Implement `StorageManager.loadCustomCategories()` and `StorageManager.saveCustomCategories(arr)` with the same pattern using `LS_KEYS.categories`
    - Implement `StorageManager.loadTheme()`: returns `localStorage.getItem(LS_KEYS.theme)` or `null`
    - Implement `StorageManager.saveTheme(theme)`: calls `localStorage.setItem(LS_KEYS.theme, theme)` (no try/catch needed for theme)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 7.7_

  - [x] 3.3 Implement `Validator` object
    - Implement `Validator.validateTransaction(name, amount)`: returns `{ ok: false, nameError: 'Item Name is required.' }` if `name.trim().length === 0`; returns `{ ok: false, nameError: 'Name must be 100 characters or fewer.' }` if `name.trim().length > 100`; returns `{ ok: false, amountError: 'Please enter a valid positive amount (1–999,999,999).' }` if `amount` is not a positive integer in [1, 999999999]; returns `{ ok: true }` otherwise
    - Implement `Validator.validateCategory(name, existingCategories)`: returns error if `name.trim().length === 0` or `> 50`; returns error if `existingCategories.some(c => c.toLowerCase() === name.trim().toLowerCase())`; returns `{ ok: true }` otherwise
    - _Requirements: 1.5, 1.6, 1.7, 5.2, 5.3_

  - [ ]* 3.4 Write property tests for Validator (Properties 1, 2, 11, 12)
    - Create `test.html` in the project root; load `fast-check` via CDN and a `<script src="js/script.js">` (adjust IIFE to expose Validator for testing)
    - **Property 1: Amount validation accepts exactly the valid range** — use `fc.integer()` arbitrary; assert `Validator.validateTransaction('Valid', v).ok === (v >= 1 && v <= 999999999)`
    - **Validates: Requirements 1.2, 1.6**
    - **Property 2: Name length validation** — use `fc.string()` arbitrary; assert `Validator.validateTransaction(s, 100).ok === (s.trim().length >= 1 && s.trim().length <= 100)`
    - **Validates: Requirements 1.5, 1.7**
    - **Property 11: Category name duplicate rejection is case-insensitive** — use `fc.array(fc.string())` and `fc.string()` arbitraries; assert that a candidate matching any existing category (lowercased) is rejected
    - **Validates: Requirements 5.2**
    - **Property 12: Category name length validation** — use `fc.string()` arbitrary; assert rejection when length 0 or > 50, acceptance otherwise (when no duplicate)
    - **Validates: Requirements 5.3**
    - Run `test.html` in a browser and verify all 4 properties pass with ≥ 100 runs each

- [x] 4. Implement core transaction logic and renderers in `js/script.js`
  - [x] 4.1 Implement business logic utility functions
    - Implement `calculateTotalSpending(transactions)`: returns `transactions.reduce((sum, t) => sum + t.amount, 0)` — returns `0` for empty array
    - Implement `calculateCategoryTotals(transactions)`: builds a `Map<string, number>` by iterating transactions; excludes any category whose sum is `<= 0` before returning
    - Implement `formatIDR(amount)`: converts a number to `'Rp ' + amount.toLocaleString('id-ID')` — verify the dot-separated thousands output; fall back to manual replace if `toLocaleString` output differs from requirements
    - Implement `formatDate(isoString)`: converts an ISO timestamp to `DD/MM/YYYY` using `new Date(isoString)` and zero-padded `getDate()`, `getMonth()+1`, `getFullYear()`
    - _Requirements: 2.1, 3.1, 3.3, 3.4_

  - [ ]* 4.2 Write property tests for business logic utilities (Properties 4, 8, 9)
    - **Property 4: IDR amount formatting round-trip** — use `fc.integer({ min: 1, max: 999999999 })` arbitrary; format then strip prefix and dots and parse back; assert result equals original integer
    - **Validates: Requirements 2.1, 3.1**
    - **Property 8: Total spending equals sum of all transaction amounts** — use `fc.array(fc.record({ amount: fc.integer({ min: 1, max: 999999999 }) }))` arbitrary; assert `calculateTotalSpending(arr) === arr.reduce((s, t) => s + t.amount, 0)`
    - **Validates: Requirements 3.1, 3.3, 3.4**
    - **Property 9: Category totals exclude zero-amount categories** — use arbitrary transactions; assert no entry in the returned Map has a value `<= 0`
    - **Validates: Requirements 4.3**
    - Run `test.html` and verify all 3 properties pass

  - [x] 4.3 Implement `renderTransactionList(transactions)` renderer
    - Clear `#transaction-list` inner HTML
    - If empty: set `innerHTML` to `<li class="empty-state">No expenses recorded yet.</li>` and return
    - Sort a copy of `transactions` by `date` descending: `[...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))`
    - For each transaction, create an `<li>` containing: transaction name, `formatIDR(amount)`, category badge, `formatDate(date)`, and a `<button class="delete-btn" data-id="${t.id}" aria-label="Delete ${t.name}">Delete</button>`
    - Attach delegated `click` listener on `#transaction-list` that calls `handleDeleteTransaction(id)` when a `.delete-btn` is clicked
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.4 Write property test for transaction list ordering (Property 5)
    - **Property 5: Transaction list is always newest-first** — use `fc.array(fc.record({ id: fc.uuid(), name: fc.string({ minLength: 1, maxLength: 10 }), amount: fc.integer({ min: 1 }), category: fc.string(), date: fc.date().map(d => d.toISOString()) }), { minLength: 2 })` arbitrary; call `renderTransactionList(arr)`; query all rendered `<li>` elements and assert each adjacent pair has a non-increasing timestamp
    - **Validates: Requirements 2.2**
    - Run `test.html` and verify this property passes

  - [x] 4.5 Implement `renderTotalSpending(total)` and `renderCategoryDropdown(allCategories)` renderers
    - `renderTotalSpending`: sets `#total-spending` text content to `formatIDR(total)`; the label "Total Spending" is static in HTML
    - `renderCategoryDropdown(allCategories)`: clears `#category` options, then populates with `[...DEFAULT_CATEGORIES, ...customCategories]` — selects the first DEFAULT_CATEGORY by default
    - _Requirements: 1.3, 1.9, 3.1, 3.2, 5.5, 5.9_

  - [x] 4.6 Implement `handleAddTransaction(event)` and form reset
    - Call `event.preventDefault()`; clear existing error spans
    - Read `#item-name` and `#amount` values; call `Validator.validateTransaction(name, amountVal)`
    - On invalid: set the relevant `#item-name-error` or `#amount-error` text content and `aria-invalid="true"` on the input; return
    - On valid: construct a new Transaction: `{ id: \`${Date.now()}-${Math.random().toString(36).slice(2)}\`, name: name.trim(), amount: parseInt(amountVal, 10), category: selectedCategory, date: new Date().toISOString() }`
    - Push to `transactions[]`; call `StorageManager.saveTransactions(transactions)`
    - Call `updateDashboard()`; reset form: `#item-name` to `''`, `#amount` to `''`, `#category` to first DEFAULT_CATEGORY
    - Clear error spans and `aria-invalid` attributes on reset
    - _Requirements: 1.5, 1.6, 1.7, 1.8, 1.9_

  - [ ]* 4.7 Write property test for transaction creation (Property 3)
    - **Property 3: Transaction creation preserves input fields** — use `fc.tuple(fc.string({ minLength: 1, maxLength: 100 }), fc.integer({ min: 1, max: 999999999 }), fc.string({ minLength: 1 }))` arbitrary; for each (name, amount, category) call the transaction factory and assert `t.name === name.trim()`, `t.amount === amount`, `t.category === category`, `t.id.length > 0`, and `new Date(t.date)` is a valid date
    - **Validates: Requirements 1.8**
    - Run `test.html` and verify this property passes

  - [x] 4.8 Implement `handleDeleteTransaction(id)`, delete modal, and confirm/cancel logic
    - `handleDeleteTransaction(id)`: show `#delete-modal` by setting `display: flex`; store the pending id in a module-level `let pendingDeleteId`
    - Wire the modal's confirm button to `handleConfirmDelete()` and cancel button to close the modal (set `display: none`), clearing `pendingDeleteId`
    - `handleConfirmDelete()`: find the index of the transaction in `transactions[]`; splice it out; call `StorageManager.saveTransactions(transactions)` wrapped in try/catch — on error re-insert at original index, call `renderTransactionList()`, show error message "Deletion could not be completed. Please try again."; on success call `updateDashboard()`; hide modal
    - _Requirements: 2.5, 2.6, 2.7, 2.8_

  - [ ]* 4.9 Write property tests for delete logic (Properties 6, 7)
    - **Property 6: Cancelling deletion leaves state unchanged** — use `fc.array(transactionArbitrary, { minLength: 1 })` and pick a random id; simulate cancel (do not call `handleConfirmDelete`); assert `transactions` array is reference-unchanged in length and contents
    - **Validates: Requirements 2.6**
    - **Property 7: Confirmed deletion removes exactly the targeted transaction** — use the same arbitraries; call `handleConfirmDelete(id)` after setting `pendingDeleteId`; assert the resulting `transactions` does not contain the deleted id, and all other ids remain present
    - **Validates: Requirements 2.7**
    - Run `test.html` and verify both properties pass

- [x] 5. Checkpoint — core functionality
  - Verify: opening `index.html` in a browser shows the form, empty list state, and "Rp 0" total
  - Verify: adding a transaction appends it to the list and updates the total
  - Verify: validation errors appear inline without `alert()`
  - Verify: deleting a transaction shows the modal, and cancel/confirm both work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement localStorage persistence, `updateDashboard`, and `init` in `js/script.js`
  - [x] 6.1 Implement `updateDashboard()` orchestration function
    - Call: `renderTransactionList(transactions)`, `renderTotalSpending(calculateTotalSpending(transactions))`, `ChartManager.update(calculateCategoryTotals(transactions))`, `renderMonthlySummary(getMonthlyGroups(transactions), selectedMonth)`
    - This function is called after every mutation (add, delete, category change, theme toggle)
    - _Requirements: 3.3, 3.4, 4.5, 6.1_

  - [x] 6.2 Implement `init()` bootstrap function
    - Read theme from `StorageManager.loadTheme()`; apply `document.documentElement.setAttribute('data-theme', theme || 'light')` immediately (prevents flash of wrong theme)
    - Update `#theme-toggle` `aria-label` to match the current theme
    - Load `transactions = StorageManager.loadTransactions()` and `customCategories = StorageManager.loadCustomCategories()`
    - Set `selectedMonth` to the most recent month key in `getMonthlyGroups(transactions)` (or `null` if no transactions)
    - Call `renderCategoryDropdown([...DEFAULT_CATEGORIES, ...customCategories])`
    - Call `ChartManager.init('spending-chart', calculateCategoryTotals(transactions), isDark)`
    - Call `updateDashboard()`
    - Attach all event listeners: `#expense-form` submit → `handleAddTransaction`, `#custom-category-form` submit → `handleAddCategory`, `#theme-toggle` click → `handleThemeToggle`, `#month-selector` change → `handleMonthChange`
    - Register `document.addEventListener('DOMContentLoaded', init)`
    - _Requirements: 5.9, 7.1, 7.8, 7.9, 8.3, 8.4, 8.5, 8.6, 8.8_

  - [ ]* 6.3 Write property tests for StorageManager round-trips (Properties 13, 20, 21)
    - **Property 13: Custom category localStorage round-trip** — use `fc.array(fc.string({ minLength: 1, maxLength: 50 }))` arbitrary; call `StorageManager.saveCustomCategories(arr)` then `StorageManager.loadCustomCategories()`; assert returned array deep-equals `arr`
    - **Validates: Requirements 5.4, 8.2, 8.4**
    - **Property 20: Theme persistence round-trip** — use `fc.constantFrom('light', 'dark')` arbitrary; call `saveTheme` then `loadTheme`; assert round-trip equality
    - **Validates: Requirements 7.7, 7.8**
    - **Property 21: Transaction array JSON serialization round-trip** — use `fc.array(transactionArbitrary)` arbitrary; call `saveTransactions(arr)` then `loadTransactions()`; assert each element's `id`, `name`, `amount`, `category`, `date` fields are identical to the original
    - **Validates: Requirements 8.1, 8.3, 8.7**
    - Run `test.html` and verify all 3 properties pass

- [x] 7. Implement Chart.js integration (`ChartManager`) in `js/script.js`
  - [x] 7.1 Implement `ChartManager.init(canvasId, categoryTotalsMap, isDark)`
    - Guard against CDN load failure: wrap in `if (typeof Chart === 'undefined') { show static error message in #chart-container; return; }`
    - If `categoryTotalsMap` is empty: hide `#chart-container`, show `#chart-empty-message`; return
    - Otherwise: call `new Chart(canvas, config)` with type `'pie'`, labels from map keys, data from map values, `backgroundColor: assignPaletteColors(count)`, title "Spending Distribution by Category", legend label colors based on `isDark`
    - Store instance in `chartInstance`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

  - [x] 7.2 Implement `ChartManager.update(categoryTotalsMap)` and `ChartManager.updateTheme(isDark)`
    - `ChartManager.update`: if map is empty, destroy existing chart, hide `#chart-container`, show `#chart-empty-message`; otherwise if `chartInstance` exists update `data.labels`, `data.datasets[0].data`, and `data.datasets[0].backgroundColor` then call `chartInstance.update()`; if no instance exists call `ChartManager.init(...)` to create a new one; show `#chart-container`, hide `#chart-empty-message`
    - `ChartManager.updateTheme(isDark)`: if `chartInstance` exists, update `options.plugins.title.color`, `options.plugins.legend.labels.color`, and `datasets[0].borderColor`, then call `chartInstance.update()`
    - `ChartManager.destroy()`: if `chartInstance` exists call `chartInstance.destroy()` and set `chartInstance = null`
    - _Requirements: 4.2, 4.3, 4.5, 4.6, 4.7, 4.8, 7.6_

  - [ ]* 7.3 Write property test for palette color cycling (Property 10)
    - **Property 10: Chart palette colors cycle through the defined palette** — use `fc.integer({ min: 0, max: 100 })` arbitrary; call `assignPaletteColors(N)`; assert result has length `N` and every element at index `i` equals `CHART_PALETTE[i % CHART_PALETTE.length]`
    - **Validates: Requirements 4.4, 4.8**
    - Run `test.html` and verify this property passes

- [x] 8. Checkpoint — chart integration
  - Open `index.html` in a browser; add several transactions in different categories
  - Verify the pie chart renders with the correct segments and green palette colors
  - Verify the chart title reads "Spending Distribution by Category"
  - Verify the chart updates immediately when a transaction is added or deleted
  - Verify that when all transactions are deleted, the chart is replaced by the empty-state message
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement custom categories feature in `js/script.js`
  - [x] 9.1 Implement `renderCategoryManager(customCategories)` renderer
    - Clear `#category-list`
    - For each custom category, append an `<li>` containing the name and a `<button class="delete-category-btn" data-name="${name}" aria-label="Delete category ${name}">Delete</button>`
    - Show DEFAULT_CATEGORIES as non-deletable list items (no delete button)
    - Add a delegated click listener on `#category-list` for `.delete-category-btn` → `handleDeleteCategory(name)`
    - _Requirements: 5.1, 5.6, 5.8_

  - [x] 9.2 Implement `handleAddCategory(event)` and `handleDeleteCategory(name)`
    - `handleAddCategory`: call `event.preventDefault()`; read `#new-category-name`; call `Validator.validateCategory(name, [...DEFAULT_CATEGORIES, ...customCategories])`; on error show `#category-error`; on success push to `customCategories[]`, call `StorageManager.saveCustomCategories(customCategories)`, `renderCategoryDropdown(...)`, `renderCategoryManager(customCategories)`, clear the input
    - `handleDeleteCategory(name)`: if `name` is in `DEFAULT_CATEGORIES`, show error "Default categories cannot be removed."; if any transaction uses this category, show error "Category is in use and cannot be deleted."; otherwise remove from `customCategories[]`, call `StorageManager.saveCustomCategories(customCategories)`, `renderCategoryDropdown(...)`, `renderCategoryManager(customCategories)`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 9.3 Write property test for category deletion guard (Property 14)
    - **Property 14: Category deletion is rejected when the category is in use** — use `fc.array(transactionArbitrary, { minLength: 1 })` and pick a category name from the transactions; attempt `handleDeleteCategory(name)`; assert `customCategories` is unchanged
    - **Validates: Requirements 5.7**
    - Run `test.html` and verify this property passes

- [x] 10. Implement monthly summary feature in `js/script.js`
  - [x] 10.1 Implement `getMonthlyGroups(transactions)` and `getMonthlySummaryStats(transactions)`
    - `getMonthlyGroups(transactions)`: returns `Map<string, Transaction[]>` keyed by `"YYYY-MM"` strings derived from each transaction's `date` using `new Date(date).getFullYear()` and `new Date(date).getMonth() + 1` (zero-padded), interpreted in local timezone
    - `getMonthlySummaryStats(transactions)`: compute total, count, topCategory (alphabetical tiebreak: sort tied categories alphabetically ascending, pick first), and breakdown (array of `{ category, total }` sorted by total descending)
    - _Requirements: 6.1, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 10.2 Write property tests for monthly grouping and stats (Properties 15, 16, 17, 18)
    - **Property 15: Monthly grouping matches local-timezone month** — use a transaction arbitrary with controlled date; assert that `getMonthlyGroups` places each transaction in the group corresponding to `new Date(t.date).getFullYear()` and `new Date(t.date).getMonth()`
    - **Validates: Requirements 6.1**
    - **Property 16: Monthly transaction count equals array length** — use `fc.array(transactionArbitrary)` all within a single month; assert `getMonthlySummaryStats(arr).count === arr.length`
    - **Validates: Requirements 6.5**
    - **Property 17: Monthly top category respects alphabetical tiebreak** — construct arrays with tied categories; assert `getMonthlySummaryStats` returns the alphabetically-first among tied categories
    - **Validates: Requirements 6.6**
    - **Property 18: Monthly breakdown is sorted descending** — use `fc.array(transactionArbitrary, { minLength: 2 })` arbitrary; assert each adjacent pair in `.breakdown` satisfies `a.total >= b.total`
    - **Validates: Requirements 6.7**
    - Run `test.html` and verify all 4 properties pass

  - [x] 10.3 Implement `renderMonthlySummary(monthlyGroups, selectedKey)` renderer
    - Populate `#month-selector` with one `<option>` per key in `monthlyGroups` sorted descending; select `selectedKey`
    - If no transactions: show empty-state message in `#monthly-stats`; return
    - Call `getMonthlySummaryStats(monthlyGroups.get(selectedKey))` and render: total IDR in `#monthly-stats`, transaction count, top category name
    - Render `#monthly-breakdown` list: one `<li>` per `{ category, total }` in `breakdown`, showing category name and `formatIDR(total)`
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [x] 10.4 Implement `handleMonthChange(monthKey)` event handler
    - Set `selectedMonth = monthKey`; call `renderMonthlySummary(getMonthlyGroups(transactions), selectedMonth)`
    - _Requirements: 6.2, 6.4_

- [ ] 11. Implement dark/light mode toggle in `js/script.js` and `css/style.css`
  - [-] 11.1 Implement `handleThemeToggle()` and apply theme helper
    - Read current `data-theme` from `document.documentElement`; toggle between `'light'` and `'dark'`
    - Call `document.documentElement.setAttribute('data-theme', newTheme)`
    - Update `#theme-toggle` button text/icon and `aria-label` to reflect the new theme
    - Call `StorageManager.saveTheme(newTheme)` and `ChartManager.updateTheme(newTheme === 'dark')`
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 11.2 Write property test for theme toggle round-trip (Property 19)
    - **Property 19: Theme toggle is its own inverse (round-trip)** — use `fc.constantFrom('light', 'dark')` arbitrary; set `document.documentElement.dataset.theme` to each value; call `handleThemeToggle()` twice; assert `data-theme` equals the original value after two toggles
    - **Validates: Requirements 7.3, 7.4, 7.5**
    - Run `test.html` and verify this property passes

  - [ ] 11.3 Verify chart contrast meets WCAG 2.1 AA in both themes
    - In `css/style.css`, verify `--color-text` on `--color-bg` (light: `#1B1B1B` on `#F5F5F5`) achieves ≥ 4.5:1 using a contrast checker
    - Verify dark mode: `#E8F5E9` on `#121212` achieves ≥ 4.5:1
    - In `ChartManager.updateTheme()`, confirm chart title and legend use `#E8F5E9` (dark) or `#1B5E20` (light) against their respective backgrounds
    - _Requirements: 7.6, 9.1_

- [~] 12. Checkpoint — optional features
  - Open `index.html`; add a custom category, assign transactions to it, and verify it appears in the chart and monthly summary
  - Toggle dark mode; verify colors change and the theme persists after a page reload
  - Navigate months in the monthly summary; verify totals, counts, and top category are correct
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Testing and cross-browser refinement
  - [~] 13.1 Run the complete property-based test suite in `test.html`
    - Open `test.html` in Chrome, Firefox, Edge, and Safari
    - All 21 property tests (Properties 1–21) must pass with ≥ 100 runs each without any assertion failures
    - Fix any failures discovered before proceeding
    - _Requirements: 1.2, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.6, 2.7, 3.1, 3.3, 3.4, 4.3, 4.4, 4.8, 5.2, 5.3, 5.4, 5.7, 6.1, 6.5, 6.6, 6.7, 7.3, 7.4, 7.5, 7.7, 7.8, 8.1, 8.2, 8.3, 8.4, 8.7_

  - [~] 13.2 Verify responsive layout at all breakpoints
    - Open `index.html` in Chrome DevTools; check viewport widths 320px, 375px, 768px, 1024px, 1440px, 2560px
    - Assert no horizontal scrollbar appears at any width; assert no element is clipped or hidden beyond viewport edge
    - At 767px and below: verify single-column stack order — Form → Total Spending → Transaction List → Chart → Monthly Summary
    - At 768px and above: verify two-column layout with each column ≥ 30% of viewport width
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [~] 13.3 Verify 200% zoom and browser zoom behavior
    - In Chrome, set zoom to 200% at viewport width 320px; assert no horizontal scrollbar appears
    - Repeat in Firefox and Edge
    - _Requirements: 9.5_

  - [~] 13.4 Verify zero JavaScript console errors in all target browsers
    - Open `index.html` in Chrome, Firefox, Edge, and Safari; open DevTools console
    - Perform the full interaction sequence: add transactions, delete a transaction, add a custom category, delete a custom category, toggle theme, navigate months
    - Assert zero JavaScript errors in console
    - _Requirements: 10.5_

  - [~] 13.5 Verify localStorage persistence across page reloads
    - Add 3 transactions and a custom category; reload the page
    - Assert all 3 transactions appear in the list and the custom category is present in the dropdown
    - Toggle to dark mode; reload; assert dark mode is applied before first paint
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 7.8_

- [~] 14. Write README.md
  - Write a `README.md` at the project root documenting: project description, features list, how to run locally (open `index.html` in a browser — no build step), how to deploy to GitHub Pages (push to a branch; set source to root), file structure, and technologies used
  - _Requirements: 10.4_

- [~] 15. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for an MVP; they cover property-based and unit testing using `fast-check` via CDN in a separate `test.html` file
- Each task references specific requirements for traceability
- The IIFE wrapper in `js/script.js` must expose module internals (Validator, StorageManager, business logic functions) on a test surface object (e.g., `window.__EBV_TEST__`) when `window.__EBV_TEST_MODE__` is set to `true` — this lets `test.html` access them without polluting the production global scope
- Checkpoints at tasks 5, 8, 12, and 15 are the right moments to do a full manual review in a real browser
- The `test.html` file is a development artifact and should be excluded from the README's folder structure description for end users

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.2", "3.3"] },
    { "id": 3, "tasks": ["3.4", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3"] },
    { "id": 5, "tasks": ["4.4", "4.5", "4.6"] },
    { "id": 6, "tasks": ["4.7", "4.8"] },
    { "id": 7, "tasks": ["4.9", "6.1"] },
    { "id": 8, "tasks": ["6.2", "7.1"] },
    { "id": 9, "tasks": ["6.3", "7.2"] },
    { "id": 10, "tasks": ["7.3", "9.1", "10.1"] },
    { "id": 11, "tasks": ["9.2", "10.2", "10.3"] },
    { "id": 12, "tasks": ["9.3", "10.4", "11.1"] },
    { "id": 13, "tasks": ["11.2", "11.3"] },
    { "id": 14, "tasks": ["13.1", "13.2", "13.3", "13.4", "13.5"] }
  ]
}
```
