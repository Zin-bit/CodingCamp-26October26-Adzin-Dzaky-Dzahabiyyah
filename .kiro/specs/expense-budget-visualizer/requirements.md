# Requirements Document

## Introduction

Expense & Budget Visualizer is a responsive, mobile-friendly web application that helps individuals track daily expenses, organize spending by category, and understand financial behavior through visual charts. The application runs entirely in the browser with no backend server; all data is persisted in the browser's Local Storage. The UI uses a green-themed, minimalist design and supports both light and dark modes. The currency is Indonesian Rupiah (IDR / Rp). Because the application only records expenses and does not track income, the primary financial indicator is labeled "Total Spending".

## Glossary

- **Application**: The Expense & Budget Visualizer single-page web application.
- **Transaction**: A single expense record containing a name, amount, category, and timestamp.
- **Category**: A label assigned to a Transaction (e.g., Food, Transport, Fun, or a Custom_Category).
- **Default_Category**: One of the three built-in categories — Food, Transport, or Fun — that cannot be deleted.
- **Custom_Category**: A user-defined category added at runtime and stored in Local Storage.
- **Form**: The HTML expense input form used to create a new Transaction.
- **Transaction_List**: The scrollable list UI component that displays all Transactions.
- **Dashboard**: The main view containing the Form, Transaction_List, Total_Spending_Display, and Chart.
- **Total_Spending_Display**: The UI component that shows the sum of all Transaction amounts.
- **Chart**: The Chart.js pie chart titled "Spending Distribution by Category".
- **Monthly_Summary**: The UI view that organizes Transactions by calendar month and year.
- **Theme_Toggle**: The control in the application header that switches between light and dark mode.
- **Local_Storage**: The browser's Web Storage API used to persist all application data.
- **Validator**: The JavaScript logic responsible for validating Form inputs before a Transaction is created.
- **Storage_Manager**: The JavaScript logic responsible for reading and writing data to Local_Storage.
- **Chart_Manager**: The JavaScript logic responsible for rendering and updating the Chart.

## Requirements

### Requirement 1: Expense Input Form

**User Story:** As an individual tracking my spending, I want to fill in a form with expense details, so that I can record a new Transaction quickly.

#### Acceptance Criteria

1. THE Form SHALL contain an "Item Name" text input field that is required before submission.
2. THE Form SHALL contain an "Amount" numeric input field that accepts only positive integers in the range 1 to 999,999,999 IDR and is required before submission.
3. THE Form SHALL contain a "Category" dropdown that lists all Default_Category values (with the first Default_Category selected by default) and all saved Custom_Category values.
4. THE Form SHALL contain an "Add Transaction" submit button.
5. WHEN the "Add Transaction" button is activated and the Item Name field is empty, THE Validator SHALL display an inline error message indicating the Item Name is required.
6. WHEN the "Add Transaction" button is activated and the Amount field is empty, zero, negative, or greater than 999,999,999, THE Validator SHALL display an inline error message indicating a valid positive amount is required.
7. WHEN the "Add Transaction" button is activated and the Item Name exceeds 100 characters, THE Validator SHALL display an inline error message indicating the name must be 100 characters or fewer.
8. WHEN the "Add Transaction" button is activated and all inputs are valid, THE Application SHALL create a new Transaction with a unique id, the entered name, the entered amount as a number, the selected category, and the current UTC date and time as an ISO 8601 timestamp.
9. WHEN a Transaction is successfully created, THE Form SHALL reset: the Item Name field to empty, the Amount field to empty, and the Category dropdown to its first Default_Category.

### Requirement 2: Transaction List Display

**User Story:** As a user, I want to see all my recorded expenses in a list, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each Transaction showing its name (up to 100 characters), amount formatted as IDR currency with the "Rp" prefix and dot-separated thousands (e.g., Rp 1.500.000), category, and date in DD/MM/YYYY format.
2. THE Transaction_List SHALL display Transactions in descending order by timestamp, with the newest Transaction first.
3. IF the Transaction_List contains no Transactions, THEN THE Transaction_List SHALL display an empty-state message indicating no expenses have been recorded.
4. WHILE the number of Transactions exceeds the visible area of the Transaction_List, THE Transaction_List SHALL remain scrollable to reveal all Transactions.
5. WHEN a user activates the delete control on a Transaction, THE Application SHALL display a confirmation prompt offering a confirm action and a cancel action before removing the Transaction.
6. IF the user cancels the deletion prompt, THEN THE Application SHALL dismiss the prompt without modifying the Transaction, Local_Storage, Total_Spending_Display, or Chart.
7. WHEN the user confirms deletion, THE Application SHALL remove the Transaction from Local_Storage, update the Total_Spending_Display, and update the Chart.
8. IF Local_Storage fails to remove the Transaction upon confirmed deletion, THEN THE Application SHALL display an error message indicating the deletion could not be completed and retain the Transaction in the Transaction_List.

### Requirement 3: Total Spending Summary

**User Story:** As a user, I want to see my total spending prominently displayed, so that I always know how much I have spent overall.

#### Acceptance Criteria

1. THE Total_Spending_Display SHALL show the sum of all Transaction amounts formatted in IDR using a dot as the thousands separator and no decimal places (e.g., "Rp 0" when no Transactions exist, "Rp 125.000" when the sum is 125,000).
2. THE Total_Spending_Display SHALL use the label "Total Spending" and SHALL NOT use labels such as "Available Balance" or "Account Balance".
3. WHEN a Transaction is added, THE Total_Spending_Display SHALL recalculate and display the updated sum within 1 second.
4. WHEN a Transaction is deleted, THE Total_Spending_Display SHALL recalculate and display the updated sum within 1 second.

### Requirement 4: Pie Chart — Spending Distribution

**User Story:** As a user, I want a pie chart that shows how my spending is distributed across categories, so that I can understand my spending patterns visually.

#### Acceptance Criteria

1. THE Chart SHALL have the title "Spending Distribution by Category".
2. THE Chart SHALL render a pie chart using Chart.js loaded via CDN.
3. THE Chart SHALL display one segment per category whose total Transaction amount is greater than zero, with each segment's arc sized proportionally to that category's share of the sum of all displayed Transaction amounts.
4. THE Chart SHALL use colors exclusively from the green color palette defined in the design specification (#E8F5E9, #A5D6A7, #66BB6A, #1B5E20, #89A482).
5. WHEN a Transaction is added or deleted, THE Chart_Manager SHALL update the Chart to reflect the current category totals without requiring a page reload.
6. WHEN there are no Transactions, THE Chart SHALL display a text message indicating that no spending data is available, in place of the chart.
7. WHEN a Custom_Category is added and assigned to a Transaction, THE Chart SHALL include that Custom_Category as a new segment.
8. IF the number of categories with a total Transaction amount greater than zero exceeds 5, THEN THE Chart SHALL assign colors by cycling through the five palette colors in the order defined in the design specification (#E8F5E9, #A5D6A7, #66BB6A, #1B5E20, #89A482), reusing them from the first color when the count exceeds 5.

### Requirement 5: Custom Categories

**User Story:** As a user, I want to create my own spending categories, so that I can organize expenses in a way that matches my lifestyle.

#### Acceptance Criteria

1. WHEN a user opens the category management UI, THE Application SHALL display an input field and a submit control that allow the user to enter and submit a new Custom_Category name.
2. WHEN a user submits a new Custom_Category name that is identical to an existing category name (case-insensitive comparison), THE Validator SHALL reject the submission and display an error message indicating the category already exists.
3. IF a user submits a Custom_Category name that is empty or exceeds 50 characters, THEN THE Validator SHALL reject the submission and display an error message indicating the name must be between 1 and 50 characters.
4. WHEN a Custom_Category name that is non-empty, 50 characters or fewer, and not a duplicate of any existing category name is submitted, THE Storage_Manager SHALL save the Custom_Category to Local_Storage under the key "customCategories".
5. WHEN a Custom_Category is saved, THE Form's Category dropdown SHALL include the new Custom_Category as a selectable option without requiring a page reload.
6. WHEN a user requests deletion of a Custom_Category that is not assigned to any existing expense, THE Storage_Manager SHALL remove the Custom_Category from Local_Storage and THE Form's Category dropdown SHALL no longer list it.
7. IF a user requests deletion of a Custom_Category that is assigned to one or more existing expenses, THEN THE Application SHALL reject the deletion and display an error message indicating the category is in use.
8. IF a user attempts to delete a Default_Category (Food, Transport, or Fun), THEN THE Application SHALL reject the deletion and display a message indicating Default_Category values cannot be removed.
9. WHEN the application starts, THE Storage_Manager SHALL load all Custom_Category values stored under the key "customCategories" in Local_Storage and make them available as selectable options in the Form's Category dropdown.

### Requirement 6: Monthly Summary

**User Story:** As a user, I want to view my expenses grouped by month, so that I can track how my spending changes over time.

#### Acceptance Criteria

1. THE Monthly_Summary SHALL organize Transactions by calendar month and year such that each Transaction's displayed month matches the calendar month of its ISO 8601 timestamp interpreted in the device's local timezone.
2. THE Monthly_Summary SHALL display a month selector control that allows navigation between months that contain at least one Transaction.
3. WHEN the application starts with at least one Transaction in Local_Storage, THE Monthly_Summary SHALL default to displaying the most recent month that contains at least one Transaction.
4. WHEN a month is selected, THE Monthly_Summary SHALL display the total spending for that month in IDR formatted with dot-separated thousands.
5. WHEN a month is selected, THE Monthly_Summary SHALL display the number of Transactions in that month.
6. WHEN a month is selected, THE Monthly_Summary SHALL display the name of the category with the highest total spending in that month; IF two or more categories share the highest total, THEN THE Monthly_Summary SHALL display the one that comes first alphabetically.
7. WHEN a month is selected, THE Monthly_Summary SHALL display a breakdown listing each category name and its total spending in IDR for that month, sorted in descending order by total spending.
8. IF a selected month contains no Transactions, THEN THE Monthly_Summary SHALL display an empty-state message indicating no data for that period.

### Requirement 7: Dark / Light Mode Toggle

**User Story:** As a user, I want to switch between light and dark mode, so that I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. IF no "preferredTheme" value exists in Local_Storage, THEN THE Application SHALL default to light mode.
2. THE Theme_Toggle SHALL be located in the application header and SHALL be operable with a single click or keypress.
3. WHEN the Theme_Toggle is activated, THE Theme_Toggle SHALL update its visual indicator to reflect the newly active theme.
4. WHEN the Theme_Toggle is activated in light mode, THE Application SHALL switch to dark mode with dark background colors while maintaining the green color identity.
5. WHEN the Theme_Toggle is activated in dark mode, THE Application SHALL switch back to light mode with light background colors while maintaining the green color identity.
6. WHEN the theme changes, THE Chart_Manager SHALL update Chart.js chart colors and label text colors to achieve a minimum contrast ratio of 4.5:1 against the active theme background.
7. WHEN the theme changes, THE Storage_Manager SHALL save the newly active theme name to Local_Storage under the key "preferredTheme".
8. WHEN the Application loads, THE Storage_Manager SHALL read the "preferredTheme" value from Local_Storage and apply the corresponding theme before the first paint, preventing a flash of the wrong theme.
9. IF the "preferredTheme" value in Local_Storage is absent or not a recognized theme name, THEN THE Application SHALL apply light mode as the default theme.

### Requirement 8: Data Persistence

**User Story:** As a user, I want my data to be saved automatically, so that my expenses are still there after I close or refresh the browser.

#### Acceptance Criteria

1. WHEN a Transaction is added or deleted, THE Storage_Manager SHALL serialize all Transactions to JSON and save them to Local_Storage under the key "expenseTransactions".
2. WHEN a Custom_Category is added or deleted, THE Storage_Manager SHALL serialize all Custom_Category values to JSON and save them to Local_Storage under the key "customCategories".
3. WHEN the Application loads, THE Storage_Manager SHALL deserialize and load all Transactions from the "expenseTransactions" key in Local_Storage.
4. WHEN the Application loads, THE Storage_Manager SHALL deserialize and load all Custom_Category values from the "customCategories" key in Local_Storage.
5. IF the "expenseTransactions" key does not exist in Local_Storage, THEN THE Storage_Manager SHALL initialize the Transaction list as an empty array.
6. IF the "customCategories" key does not exist in Local_Storage, THEN THE Storage_Manager SHALL initialize the Custom_Category list as an empty array.
7. FOR ALL valid Transaction arrays, serializing then deserializing with JSON SHALL produce an array where each Transaction retains identical values for all of its fields compared to the original (round-trip property).
8. IF the value stored under "expenseTransactions" or "customCategories" in Local_Storage cannot be parsed as valid JSON, THEN THE Storage_Manager SHALL discard the corrupted value and initialize the corresponding list as an empty array.
9. IF Local_Storage throws an exception during a write operation, THEN THE Storage_Manager SHALL retain the current in-memory state and display an error message to the user indicating that data could not be saved.

### Requirement 9: Responsive Layout

**User Story:** As a user on any device, I want the application to be usable on both mobile and desktop screens, so that I can track expenses wherever I am.

#### Acceptance Criteria

1. THE Application SHALL render all interactive elements — Form inputs, buttons, Transaction_List items, and Chart — without horizontal scrollbar and without any element being clipped or hidden beyond the viewport edge, across viewport widths from 320px to 2560px.
2. THE Application SHALL use CSS Flexbox or CSS Grid for layout so that no component overflows its container at any viewport width between 320px and 2560px.
3. WHEN the viewport width is below 768px, THE Application SHALL display the Form, Total_Spending_Display, Transaction_List, and Chart stacked vertically in that top-to-bottom order in a single-column layout.
4. WHEN the viewport width is 768px or above, THE Application SHALL display the Form in a left column and the Transaction_List, Total_Spending_Display, and Chart in a right column, with each column occupying at least 30% of the viewport width.
5. THE Application SHALL pass browser-level zoom up to 200% without a horizontal scrollbar appearing on any viewport width of 320px or greater.

### Requirement 10: Technology Constraints and Deployment

**User Story:** As a developer deploying this project, I want the application to follow a strict technology and folder structure, so that it can be hosted on GitHub Pages without a build step.

#### Acceptance Criteria

1. THE Application SHALL be implemented using only HTML5, CSS3, and vanilla JavaScript with no frontend frameworks, transpilers, or bundlers.
2. THE Application SHALL load Chart.js exclusively via a CDN link inside index.html and SHALL NOT bundle or install it locally.
3. THE Application SHALL be structured with exactly one CSS file at `css/style.css` and exactly one JavaScript file at `js/script.js`.
4. THE Application SHALL use relative file paths for all `<script src>`, `<link href>`, and `<img src>` internal asset references so that it is deployable to GitHub Pages without modification.
5. THE Application SHALL render all pages and interactive features without JavaScript errors in the browser console in the latest stable versions of Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari.
