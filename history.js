import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { collection, getDocs,doc, query, where } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

let currentUser;

// Elements
const calendarGrid = document.getElementById('calendarGrid');
const btn7 = document.getElementById('last7');
const btn30 = document.getElementById('last30');
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const applyBtn = document.getElementById('applyRange');

// Auth listener
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    currentUser = user;
    loadHistory('last7'); // default
  }
});

// Date Range Calculation
function getDateRange(mode) {
  const today = new Date();
  let startDate, endDate;

  if (mode === 'last7') {
    endDate = today;
    startDate = new Date();
    startDate.setDate(today.getDate() - 6);
  } else if (mode === 'last30') {
    endDate = today;
    startDate = new Date();
    startDate.setDate(today.getDate() - 29);
  } else if (mode === 'custom') {
    startDate = new Date(startInput.value);
    endDate = new Date(endInput.value);
    if (isNaN(startDate) || isNaN(endDate)) return null;
  }

  return { startDate, endDate };
}

// Load and Render

async function loadHistory(mode) {
  const range = getDateRange(mode);
  if (!range || !currentUser) return;

  const { startDate, endDate } = range;
  const formattedDates = generateDateList(startDate, endDate);

  // ✅ FIXED: Accessing subcollection using a valid DocumentReference
  const userDocRef = doc(db, 'users', currentUser.uid);
  const prayersColRef = collection(userDocRef, 'prayers');
  const snapshot = await getDocs(prayersColRef);

  const prayerData = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    const docDate = data.date;
    if (formattedDates.includes(docDate)) {
      if (!prayerData[docDate]) prayerData[docDate] = {};
      prayerData[docDate][data.prayerName] = {
        status: data.status,
        time: data.time,
      };
    }
  });

  renderGrid(formattedDates, prayerData);
}



// Date List
function generateDateList(start, end) {
  const dateList = [];
  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    dateList.push(dateStr);
    current.setDate(current.getDate() + 1);
  }
  return dateList;
}

// UI Grid Renderer
function renderGrid(dates, data) {
  calendarGrid.innerHTML = ''; // clear

  dates.forEach(dateStr => {
    const prayers = data[dateStr] || {};
    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded shadow-md';

    card.innerHTML = `
      <h3 class="text-lg font-bold text-blue-700 mb-2">${formatDate(dateStr)}</h3>
      <div class="grid grid-cols-2 gap-2 text-sm">
        ${['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(p => {
          const record = prayers[p];
          let color = 'text-gray-400', status = 'Not marked';
          if (record) {
            if (record.status === 'Ada') color = 'text-green-600';
            else if (record.status === 'Qaza') color = 'text-yellow-600';
            else if (record.status === 'Missed') color = 'text-red-600';
            status = record.status + ` (${record.time})`;
          }
          return `<div class="${color}"><strong>${p}:</strong> ${status}</div>`;
        }).join('')}
      </div>
    `;
    calendarGrid.appendChild(card);
  });
}

// Helpers
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Event Listeners
btn7.addEventListener('click', () => loadHistory('last7'));
btn30.addEventListener('click', () => loadHistory('last30'));
applyBtn.addEventListener('click', () => loadHistory('custom'));


















// import { db, auth } from './firebase-config.js';
// import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
// import {
//   collection,
//   getDoc,
//   doc
// } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// let currentUser = null;

// // HTML Elements
// const grid = document.getElementById('calendar-grid');
// const rangeSelector = document.getElementById('range-selector');
// const customRange = document.getElementById('custom-range');
// const customStart = document.getElementById('start-date');
// const customEnd = document.getElementById('end-date');

// const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// onAuthStateChanged(auth, async (user) => {
//   if (!user) {
//     window.location.href = 'login.html';
//     return;
//   }

//   currentUser = user;
//   loadHistory();
// });

// rangeSelector.addEventListener('change', () => {
//   if (rangeSelector.value === 'custom') {
//     customRange.classList.remove('hidden');
//   } else {
//     customRange.classList.add('hidden');
//     loadHistory();
//   }
// });

// customStart.addEventListener('change', loadHistory);
// customEnd.addEventListener('change', loadHistory);

// function getDateRange() {
//   const today = new Date();
//   let startDate, endDate;

//   if (rangeSelector.value === '7') {
//     endDate = new Date(today);
//     startDate = new Date(today);
//     startDate.setDate(startDate.getDate() - 6);
//   } else if (rangeSelector.value === '30') {
//     endDate = new Date(today);
//     startDate = new Date(today);
//     startDate.setDate(startDate.getDate() - 29);
//   } else {
//     startDate = new Date(customStart.value);
//     endDate = new Date(customEnd.value);
//   }

//   return { startDate, endDate };
// }

// async function loadHistory() {
//   if (!currentUser) return;

//   const { startDate, endDate } = getDateRange();
//   const days = getDatesBetween(startDate, endDate);
//   grid.innerHTML = '';

//   for (const date of days) {
//     const dateStr = date.toISOString().split('T')[0];
//     const docRef = doc(db, `users/${currentUser.uid}/prayerHistory/${dateStr}`);
//     const docSnap = await getDoc(docRef);

//     const prayerData = docSnap.exists() ? docSnap.data() : {};
//     const card = createDayCard(dateStr, prayerData);
//     grid.appendChild(card);
//   }
// }

// function createDayCard(dateStr, prayerData) {
//   const card = document.createElement('div');
//   card.className = 'bg-white shadow p-4 rounded-md';

//   const dateTitle = document.createElement('h3');
//   dateTitle.className = 'font-semibold mb-2 text-sm text-gray-700';
//   dateTitle.textContent = dateStr;
//   card.appendChild(dateTitle);

//   const prayerList = document.createElement('div');
//   prayerList.className = 'grid grid-cols-2 gap-2';

//   PRAYERS.forEach(prayer => {
//     const status = prayerData[prayer]?.status || 'Missed';
//     const statusClass =
//       status === 'Ada' ? 'bg-green-100 text-green-800' :
//       status === 'Qaza' ? 'bg-yellow-100 text-yellow-800' :
//                           'bg-red-100 text-red-800';

//     const item = document.createElement('div');
//     item.className = `px-2 py-1 rounded text-xs font-medium ${statusClass}`;
//     item.textContent = `${capitalize(prayer)}: ${status}`;
//     prayerList.appendChild(item);
//   });

//   card.appendChild(prayerList);
//   return card;
// }

// function getDatesBetween(start, end) {
//   const dateArray = [];
//   let currentDate = new Date(start);
//   while (currentDate <= end) {
//     dateArray.push(new Date(currentDate));
//     currentDate.setDate(currentDate.getDate() + 1);
//   }
//   return dateArray;
// }

// function capitalize(str) {
//   return str.charAt(0).toUpperCase() + str.slice(1);
// }
