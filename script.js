import { db, auth } from "./firebaseConfig.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Get user info
const nickname = localStorage.getItem("nickname") || "User";
const userId = localStorage.getItem("uid");

if (!userId) {
  alert("Please log in first.");
  window.location.href = "website.html";
}

document.getElementById(
  "welcomeMsg"
).innerText = `Welcome to your Dashboard, ${nickname}!`;

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "website.html";
});

// DOM elements
const monthsList = document.getElementById("monthsList");
const incomeBtn = document.getElementById("incomeBtn");
const expenseBtn = document.getElementById("expenseBtn");
const addBtn = document.getElementById("addBtn");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amountInput");
const historyList = document.getElementById("historyList");
const yearSelector = document.getElementById("yearSelector");

// Months & years
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const shortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const currentYear = new Date().getFullYear();
let selectedYear = currentYear;
let selectedMonth = 0;
let transactionType = null;

// Transactions object: { year: { monthName: [] } }
let allTransactions = {};

// Populate year selector
for (let y = currentYear - 5; y <= currentYear + 5; y++) {
  const option = document.createElement("option");
  option.value = y;
  option.innerText = y;
  if (y === currentYear) option.selected = true;
  yearSelector.appendChild(option);
}

monthNames.forEach((month, index) => {
  const monthEl = document.createElement("div");
  monthEl.classList.add("month");

  // Store both full and short versions as attributes
  monthEl.setAttribute("data-text", month);
  monthEl.setAttribute("data-short", shortMonthNames[index]); // use abbreviation

  // Use spans (CSS will decide which one is visible)
  monthEl.innerHTML = `
    <span class="month-text">${month}</span>
    <span class="month-short">${shortMonthNames[index]}</span>
    <span class="totalValue">₱0</span>
  `;

  // Click handler
  monthEl.addEventListener("click", () => {
    if (selectedMonth !== null) {
      monthsList.children[selectedMonth].classList.remove("selected");
    }
    monthEl.classList.add("selected");
    selectedMonth = index;
    loadMonthTransactions(selectedMonth);
  });

  monthsList.appendChild(monthEl);
});

// Ensure year & months exist
function ensureYear(year) {
  if (!allTransactions[year]) allTransactions[year] = {};
  monthNames.forEach((m) => {
    if (!allTransactions[year][m]) allTransactions[year][m] = [];
  });
}

// ✅ Currency formatter
function formatCurrency(value) {
  return "₱" + value.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

// Load user data from Firestore
async function loadUserData() {
  const userDocRef = doc(db, "users", userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    allTransactions = docSnap.data().transactions || {};
  } else {
    allTransactions = {};
  }

  ensureYear(selectedYear);

  // Update totals for all months
  monthNames.forEach((_, index) => updateMonthTotal(index));

  // Load transactions only for selected month
  loadMonthTransactions(selectedMonth);

  updatePieChart();
}

// Save data to Firestore
async function saveUserData() {
  const userDocRef = doc(db, "users", userId);
  await setDoc(userDocRef, { transactions: allTransactions }, { merge: true });
}

// Button toggles
incomeBtn.addEventListener("click", () => {
  transactionType = "income";
  incomeBtn.classList.add("active");
  expenseBtn.classList.remove("active");
});
expenseBtn.addEventListener("click", () => {
  transactionType = "expense";
  expenseBtn.classList.add("active");
  incomeBtn.classList.remove("active");
});

amountInput.addEventListener("input", (e) => {
  // Remove everything except digits
  let value = e.target.value.replace(/[^\d]/g, "");

  // If empty, show ₱0.00
  if (value === "") {
    e.target.value = "₱0.00";
    return;
  }

  // Convert to number and format with commas
  let numberValue = parseFloat(value);
  e.target.value = "₱" + numberValue.toLocaleString("en-PH");
});

// ✅ Add transaction
addBtn.addEventListener("click", async () => {
  if (selectedMonth === null) return alert("Select a month first");

  const desc = descInput.value.trim();
  let rawAmount = amountInput.value.replace(/[₱,]/g, "");
  let amount = parseFloat(rawAmount);

  if (!desc || !amount || !transactionType)
    return alert("Fill Description, Amount, and select Income/Expense");

  const monthName = monthNames[selectedMonth];
  allTransactions[selectedYear][monthName].unshift({
    desc,
    amount, // ✅ save numeric only
    type: transactionType,
  });
  await saveUserData();
  loadMonthTransactions(selectedMonth);

  // ✅ Animate scroll to top
  historyList.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  updateMonthTotal(selectedMonth);

  descInput.value = "";
  amountInput.value = "";
});

// Load transactions for a month
function loadMonthTransactions(monthIndex) {
  const monthName = monthNames[monthIndex];
  historyList.innerHTML = "";

  allTransactions[selectedYear][monthName].forEach((t, idx) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
    <span>${t.desc}</span>
    <span style="color:${t.type === "income" ? "green" : "red"}">
     ${t.type === "income" ? "+" : "-"}${formatCurrency(t.amount)}
    </span>
    <button class="deleteBtn">Delete</button>
  `;
    historyList.appendChild(item);

    item.querySelector(".deleteBtn").addEventListener("click", async () => {
      allTransactions[selectedYear][monthName].splice(idx, 1);
      await saveUserData();
      loadMonthTransactions(monthIndex);
      updateMonthTotal(monthIndex);
    });
  });

  updateMonthTotal(monthIndex);
}

// Update month total and side value
function updateMonthTotal(monthIndex) {
  const monthName = monthNames[monthIndex];
  const monthDiv = monthsList.children[monthIndex];

  const total = allTransactions[selectedYear][monthName].reduce(
    (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
    0
  );
  const totalSpan = monthDiv.querySelector(".totalValue");
  totalSpan.style.color = total >= 0 ? "green" : "red";
  totalSpan.innerText = formatCurrency(total);

  updatePieChart();
}

// Pie chart
const ctx = document.getElementById("pieChart").getContext("2d");
const pieChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: ["Income", "Expense"],
    datasets: [{ data: [0, 0], backgroundColor: ["#1A2A80", "#B2B0E8"] }],
  },
  options: { responsive: true },
});

function updatePieChart() {
  let totalIncome = 0,
    totalExpense = 0;
  monthNames.forEach((m) => {
    allTransactions[selectedYear][m].forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });
  });

  pieChart.data.datasets[0].data = [totalIncome, totalExpense];
  pieChart.update();

  document.getElementById("totalIncome").innerText =
    formatCurrency(totalIncome);
  document.getElementById("totalExpense").innerText =
    formatCurrency(totalExpense);
  document.getElementById("balance").innerText = formatCurrency(
    totalIncome - totalExpense
  );
  document.getElementById("yearSavings").innerText = formatCurrency(
    totalIncome - totalExpense
  );
}

// Handle year change
yearSelector.addEventListener("change", () => {
  selectedYear = parseInt(yearSelector.value);
  ensureYear(selectedYear);
  loadMonthTransactions(selectedMonth);
  updatePieChart();
});

// Initial load
loadUserData();
