// import { auth, db, onAuthStateChanged, getDocs, collection  } from './firebase-config.js';
// import { doc, getDoc, setDoc} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// const locationDisplay = document.getElementById('locationDisplay');
// const prayerTimingsSection = document.getElementById('prayerTimingsSection');

// let currentUser = null;

// onAuthStateChanged(auth, async (user) => {
//   if (!user) {
//     window.location.href = 'login.html';
//     return;
//   }

//   currentUser = user;
//   const uid = user.uid;
//   const locationRef = doc(db, `users/${uid}/settings/location`);

//   try {
//     const docSnap = await getDoc(locationRef);
//     if (docSnap.exists()) {
//       const loc = docSnap.data();
//       locationDisplay.textContent = `${loc.city}, ${loc.country}`;
//       fetchPrayerTimings(loc.city, loc.country);
//     } else {
//       locationDisplay.textContent = 'No location found.';
//     }
//   } catch (err) {
//     console.error('Error fetching location:', err);
//     locationDisplay.textContent = 'Error loading location.';
//   }
// });

// async function fetchPrayerTimings(city, country) {
//   try {
//     const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=2`);
//     const data = await response.json();
//     const timings = data.data.timings;

//     const prayersToShow = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
//     const now = new Date();
//     const currentTime = now.getHours() * 60 + now.getMinutes();

//     const jamatTimings = await getSavedJamatTimings();

//     let nextJamat = null;
//     let minDiff = Infinity;

//     prayersToShow.forEach(prayer => {
//       const jamatTimeStr = jamatTimings[prayer];
//       if (jamatTimeStr) {
//         const [h, m] = jamatTimeStr.split(':').map(Number);
//         const jamatMinutes = h * 60 + m;
//         const diff = jamatMinutes - currentTime;
//         if (diff > 0 && diff < minDiff) {
//           minDiff = diff;
//           nextJamat = prayer;
//         }
//       }
//     });

//     prayerTimingsSection.className = 'grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 pb-8';

//     prayerTimingsSection.innerHTML = '';
//     prayersToShow.forEach(async prayer => {
//       const start = timings[prayer];
//       const endIndex = prayersToShow.indexOf(prayer) + 1;
//       const end = endIndex < prayersToShow.length ? timings[prayersToShow[endIndex]] : 'Next Day';

//       const markedPrayers = await getMarkedPrayersToday();
//       const markInfo = markedPrayers[prayer];
//       const alreadyMarked = !!markInfo;
//       const markText = alreadyMarked ? `${markInfo.status} at ${markInfo.time}` : 'Mark Prayer';

//       const savedJamat = jamatTimings[prayer] || '';

//       const card = document.createElement('div');
//       card.className = `rounded-lg shadow-lg p-4 border-l-4 ${
//         prayer === nextJamat ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'
//       }`;

//       card.innerHTML = `
//         <h2 class="text-xl font-bold mb-1">${prayer}</h2>
//         <p class="text-sm text-gray-600 mb-1">Start: ${start}</p>
//         <p class="text-sm text-gray-600 mb-3">End: ${end}</p>

//         <div class="flex items-center space-x-2 mb-3">
//           <input type="time" id="jamat-${prayer}" value="${savedJamat}" class="border px-2 py-1 rounded w-full" />
//           <button data-prayer="${prayer}" class="saveJamatBtn bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-2 rounded whitespace-nowrap">
//             Save
//           </button>
//         </div>

//         <button data-prayer="${prayer}" class="markPrayerBtn ${
//           alreadyMarked ? 'bg-green-600' : 'bg-yellow-500'
//         } text-white font-semibold text-sm py-2 w-full rounded hover:opacity-90">
//           ${markText}
//         </button>
//       `;

//       prayerTimingsSection.appendChild(card);
//     });

//     addJamatSaveListeners();
//     addPrayerMarkListeners();
//   } catch (err) {
//     console.error('Error fetching prayer timings:', err);
//     prayerTimingsSection.innerHTML = '<p class="text-red-500">Failed to load prayer timings.</p>';
//   }
// }

// function addJamatSaveListeners() {
//   const buttons = document.querySelectorAll('.saveJamatBtn');
//   buttons.forEach(button => {
//     button.addEventListener('click', async () => {
//       const prayer = button.getAttribute('data-prayer');
//       const timeInput = document.getElementById(`jamat-${prayer}`);
//       const jamatTime = timeInput.value;

//       if (!jamatTime) return alert('Please select a jamat time.');

//       try {
//         const jamatRef = doc(db, `users/${currentUser.uid}/settings/jamatTimings`);
//         const jamatDoc = await getDoc(jamatRef);
//         const jamatData = jamatDoc.exists() ? jamatDoc.data() : {};
//         jamatData[prayer] = jamatTime;
//         await setDoc(jamatRef, jamatData);
//         alert(`Jamat time for ${prayer} saved.`);
//       } catch (err) {
//         console.error('Error saving jamat time:', err);
//         alert('Failed to save jamat time.');
//       }
//     });
//   });
// }

// function addPrayerMarkListeners() {
//   const markBtns = document.querySelectorAll('.markPrayerBtn');
//   markBtns.forEach(btn => {
//     btn.addEventListener('click', async () => {
//       const prayer = btn.getAttribute('data-prayer');
//       const status = await showPrayerMarkPopup();
//       if (!status) return;

//       const dateStr = new Date().toISOString().split('T')[0];
//       const timeStr = new Date().toLocaleTimeString();

//       try {
//         const markRef = doc(db, `users/${currentUser.uid}/prayers/${dateStr}`);
//         const docSnap = await getDoc(markRef);
//         const data = docSnap.exists() ? docSnap.data() : {};
//         data[prayer] = { status, time: timeStr };
//         await setDoc(markRef, data);
//         fetchPrayerTimings(locationDisplay.textContent.split(',')[0], locationDisplay.textContent.split(',')[1].trim());
//       } catch (err) {
//         console.error('Error marking prayer:', err);
//         alert('Failed to mark prayer.');
//       }
//     });
//   });
// }

// async function showPrayerMarkPopup() {
//   return new Promise((resolve) => {
//     const choice = prompt("Mark prayer as:\n1. Ada\n2. Qaza\n3. Missed\nEnter 1, 2, or 3:");
//     if (choice === '1') resolve('Ada');
//     else if (choice === '2') resolve('Qaza');
//     else if (choice === '3') resolve('Missed');
//     else resolve(null);
//   });
// }

// async function getSavedJamatTimings() {
//   try {
//     const ref = doc(db, `users/${currentUser.uid}/settings/jamatTimings`);
//     const docSnap = await getDoc(ref);
//     return docSnap.exists() ? docSnap.data() : {};
//   } catch {
//     return {};
//   }
// }

// async function getMarkedPrayersToday() {
//   const dateStr = new Date().toISOString().split('T')[0];
//   try {
//     const ref = doc(db, `users/${currentUser.uid}/prayers/${dateStr}`);
//     const docSnap = await getDoc(ref);
//     return docSnap.exists() ? docSnap.data() : {};
//   } catch {
//     return {};
//   }
// }


























// js/dashboard.js
import {
  auth,
  db,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  onAuthStateChanged
} from './firebase-config.js';

const locationDisplay = document.getElementById('locationDisplay');
const setLocationBtn = document.getElementById('setLocationBtn');
const logoutBtn = document.getElementById('logoutBtn');

let currentUser;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;
  const uid = user.uid;
  const locationRef = doc(db, `users/${uid}/settings/location`);

  try {
    const docSnap = await getDoc(locationRef);
    if (docSnap.exists()) {
      const loc = docSnap.data();
      locationDisplay.textContent = `${loc.city || ''}, ${loc.country || ''}`;
      
      // ✅ Fetch prayer timings now
      fetchPrayerTimings(loc.city, loc.country);

    } else {
      locationDisplay.textContent = 'No location found.';
      setLocationBtn.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Error fetching location:', err);
    locationDisplay.textContent = 'Error loading location.';
  }
});



setLocationBtn.addEventListener('click', async () => {
  if (!auth.currentUser) return;

  if (!navigator.geolocation) {
    locationDisplay.textContent = 'Geolocation is not supported by your browser.';
    return;
  }

  locationDisplay.textContent = 'Getting your location...';

  navigator.geolocation.getCurrentPosition(async (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    try {
      // TEMPORARY public OpenCage key
      const apiKey = '5fec9aefb8224b729ae2ef901e7b8ac1';
      const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`);
      const geoData = await geoRes.json();

      const components = geoData.results[0]?.components || {};
      const city = components.city || components.town || components.village || components.state || 'Unknown';
      const country = components.country || 'Unknown';

      const locationData = {
        city,
        country,
        // latitude,
        // longitude,
      };

      const locationRef = doc(db, `users/${auth.currentUser.uid}/settings/location`);
      await setDoc(locationRef, locationData, { merge: true });

      locationDisplay.textContent = `${city}, ${country} `;
      setLocationBtn.classList.add('hidden');

    } catch (err) {
      console.error('Error fetching city name:', err);
      locationDisplay.textContent = 'Could not fetch city name.';
    }

  }, (error) => {
    console.error('Geolocation error:', error);
    locationDisplay.textContent = 'Permission denied or location unavailable.';
  });
});




logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    window.location.href = 'login.html';
  });
});
















// Section 2


const prayerTimingsSection = document.createElement('section');
prayerTimingsSection.id = 'prayerTimings';
prayerTimingsSection.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 pb-8';
document.body.appendChild(prayerTimingsSection);

async function fetchPrayerTimings(city, country) {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];

  const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const timings = data.data.timings;

    renderPrayerCards(timings);
  } catch (error) {
    console.error('Failed to fetch prayer timings:', error);
    prayerTimingsSection.innerHTML = '<p class="text-red-600">❌ Failed to load prayer timings.</p>';
  }
}













function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // "HH:MM"
}


async function getSavedJamatTimings() {
  const uid = currentUser.uid;
  const jamatRef = doc(db, `users/${uid}/settings/jamatTimings`);

  try {
    const docSnap = await getDoc(jamatRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return {};
    }
  } catch (err) {
    console.error('Failed to fetch saved jamat timings:', err);
    return {};
  }
}
async function fetchTodayTimings() {
  const locRef = doc(db, `users/${currentUser.uid}/settings/location`);
  const locSnap = await getDoc(locRef);
  if (!locSnap.exists()) return {};
  const loc = locSnap.data();
  const city = loc.city;
  const country = loc.country;
  const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;

  const res = await fetch(apiUrl);
  const data = await res.json();
  return data.data.timings;
}


async function renderPrayerCards(timings) {
  const prayersToShow = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const jamatTimings = await getSavedJamatTimings();
  const markedPrayers = await getMarkedPrayersToday();
  const currentTime = getCurrentTime();

  // Find the next Jamat (first one after current time)
  let nextJamat = null;
  for (const prayer of prayersToShow) {
    const jamat = jamatTimings[prayer];
    if (jamat && jamat > currentTime) {
      nextJamat = prayer;
      break;
    }
  }

  prayerTimingsSection.innerHTML = ''; // Clear previous cards

  for (const prayer of prayersToShow) {
    const startTime = timings[prayer];
    const endTime = timings[`Sunset`] || 'Unknown';
    const savedJamat = jamatTimings[prayer] || '';
    const isNext = prayer === nextJamat;
    const marked = markedPrayers[prayer];
    const alreadyMarked = !!marked;
    const markText = alreadyMarked ? `Marked: ${marked.status}` : 'Mark Prayer';

    const card = document.createElement('div');
    card.className = `rounded shadow p-4 text-center border transition ${
      isNext ? 'bg-green-100 border-green-500' : 'bg-white border-blue-100'
    }`;

    card.innerHTML = `
      <h3 class="text-lg font-bold text-blue-700">${prayer}</h3>
      <p class="text-gray-600">Start: <span class="font-medium">${startTime}</span></p>
      <p class="text-gray-600 mb-2">End: <span class="font-medium">${endTime}</span></p>
      <input type="time" id="jamat-${prayer}" value="${savedJamat}" class="border px-2 py-1 rounded w-full mb-2" />
      <button data-prayer="${prayer}" class="saveJamatBtn bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded">
        Save Jamat
      </button>

      <button data-prayer="${prayer}" class="markPrayerBtn ${
        alreadyMarked ? 'bg-green-600' : 'bg-yellow-400'
      } text-white text-sm py-1 px-3 rounded mt-2 hover:opacity-90">
        ${markText}
      </button>

      ${isNext ? `<p class="text-green-700 font-semibold mt-2">Next Jamat ⏰</p>` : ''}
      ${
        alreadyMarked
          ? `<p class="text-sm mt-2 text-gray-700">🕓 Marked at ${new Date(
              marked.markedAt
            ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>`
          : ''
      }
    `;

    prayerTimingsSection.appendChild(card);
  }

  addJamatSaveListeners();
  addPrayerMarkListeners();
}










function addJamatSaveListeners() {
  const buttons = document.querySelectorAll('.saveJamatBtn');

  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const prayer = button.getAttribute('data-prayer');
      const input = document.getElementById(`jamat-${prayer}`);
      const jamatTime = input.value;

      if (!jamatTime) {
        alert('Please select a Jamat time first.');
        return;
      }

      const uid = currentUser.uid;
      const jamatRef = doc(db, `users/${uid}/settings/jamatTimings`);

      try {
        await setDoc(jamatRef, {
          [prayer]: jamatTime
        }, { merge: true });

        alert(`${prayer} Jamat time saved: ${jamatTime}`);
      } catch (error) {
        console.error(`Error saving ${prayer} Jamat:`, error);
        alert('Failed to save jamat time. Please try again.');
      }
    });
  });
}

















// Marking Functionality


function addPrayerMarkListeners() {
  const buttons = document.querySelectorAll('.markPrayerBtn');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const prayer = button.getAttribute('data-prayer');

      const status = prompt(`Mark ${prayer} as:\nEnter "Ada", "Qaza", or "Missed"`);

      if (!['Ada', 'Qaza', 'Missed'].includes(status)) {
        alert('Invalid input. Please type: Ada, Qaza, or Missed.');
        return;
      }

      markPrayerInFirestore(prayer, status);
    });
  });
}


function getTodayDateString() {
  return new Date().toISOString().split('T')[0]; // e.g., "2025-07-26"
}

async function markPrayerInFirestore(prayer, status) {
  const uid = currentUser.uid;
  const date = getTodayDateString();
  const prayerRef = doc(db, `users/${uid}/prayers/${date}`);

  const record = {
    [prayer]: {
      status,
      markedAt: new Date().toISOString()
    }
  };

  try {
    await setDoc(prayerRef, record, { merge: true });
    alert(`${prayer} marked as ${status}`);
    renderPrayerCards(await fetchTodayTimings()); // re-render to update buttons
  } catch (error) {
    console.error(`Failed to mark ${prayer}:`, error);
    alert("❌ Could not save prayer mark.");
  }
}

async function getMarkedPrayersToday() {
  const uid = currentUser.uid;
  const date = getTodayDateString();
  const ref = doc(db, `users/${uid}/prayers/${date}`);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
    return {};
  } catch (e) {
    console.error("Error getting today's marks:", e);
    return {};
  }
}
