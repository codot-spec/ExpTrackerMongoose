// Function to reload expenses and handle pagination
function reloadExpenses() {
  const token = localStorage.getItem('token');
  const decodedToken = parseJwt(token);
  const isPremiumUser = decodedToken.isPremium;

  let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage'), 10) || 2;
  let currentPage = 1; // Default to page 1 after submission

  if (isPremiumUser) {
      filterExpenses('monthly', currentPage, rowsPerPage); // Reload premium expenses
  } else {
      fetchAndDisplayExpenses(currentPage, rowsPerPage); // Reload non-premium expenses
  }
}

// Function to fetch expenses and display them with pagination
function fetchAndDisplayExpenses(page = 1, rowsPerPage = 2) {
  const token = localStorage.getItem('token');
  axios.get(`http://localhost:3000/expenses?page=${page}&limit=${rowsPerPage}`, {
      headers: { "Authorization": token }
  })
  .then(response => {
      const { expenses, pagination } = response.data;
      const expenseList = document.getElementById('expenseList');
      expenseList.innerHTML = '';  // Clear the previous list

      expenses.forEach(expense => {
          const expenseItem = document.createElement("li");
          expenseItem.dataset.expenseId = expense._id;
          expenseItem.dataset.amount = expense.amount;
          expenseItem.dataset.description = expense.description;
          expenseItem.dataset.category = expense.category;

          expenseItem.innerHTML = `${expense.amount} - ${expense.description} - ${expense.category}
              <button class="delete-button" onclick="deleteExpense('${expense._id}')">Delete</button>
              <button class="edit-button" onclick="editExpense('${expense._id}', '${expense.amount}', '${expense.description}', '${expense.category}')">Edit</button>`;
          expenseList.appendChild(expenseItem);
      });

      // Display pagination buttons
      const paginationInfo = document.getElementById('paginationInfo');
      paginationInfo.innerHTML = `
          <p>Page ${pagination.currentPage} of ${pagination.totalPages}</p>
          <button onclick="fetchAndDisplayExpenses(${pagination.currentPage - 1}, ${rowsPerPage})" ${pagination.currentPage <= 1 ? 'disabled' : ''}>Previous</button>
          <button onclick="fetchAndDisplayExpenses(${pagination.currentPage + 1}, ${rowsPerPage})" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>Next</button>
      `;
  })
  .catch(error => console.log(error));
}

// Function to delete an expense
function deleteExpense(expenseId) {
  const token = localStorage.getItem('token');
  axios.delete(`http://localhost:3000/expenses/${expenseId}`, { headers: { "Authorization": token } })
      .then(() => {
          reloadExpenses();
      })
      .catch(error => console.log(error));
}

// Function to edit an expense
function editExpense(expenseId, amount, description, category) {
  const editUrl = `../Expense-form/index.html?id=${encodeURIComponent(expenseId)}&amount=${encodeURIComponent(amount)}&description=${encodeURIComponent(description)}&category=${encodeURIComponent(category)}`;
  window.location.href = editUrl;
}

// Function to show the leaderboard for premium users
// function showleaderboard() {
//   const inputElement = document.createElement('input');
//   inputElement.type = "button";
//   inputElement.value = "Show Leaderboard";
//   inputElement.onclick = async () => {
//       const token = localStorage.getItem('token');
//       const currentPage = 1;
//       const rowsPerPage = 2;
      
//       const leaderboardResponse = await axios.get(`http://localhost:3000/premium/showLeaderBoard?page=${currentPage}&limit=${rowsPerPage}`, {
//           headers: { "Authorization": token }
//       });

//       const leaderboardArray = leaderboardResponse.data.leaderboard;
//       const leaderBoardEle = document.getElementById('leaderboard');
//       leaderBoardEle.innerHTML = '<h1>Leader Board</h1>';
      
//       leaderboardArray.forEach((userDetails) => {
//           leaderBoardEle.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.totalExpenses || 0}</li>`;
//       });

//       const paginationInfo = document.createElement('div');
//       const { pagination } = leaderboardResponse.data;
//       paginationInfo.innerHTML = `
//           <p>Page ${pagination.currentPage} of ${pagination.totalPages}</p>
//           <button onclick="changeLeaderboardPage(${pagination.currentPage - 1})" ${pagination.currentPage <= 1 ? 'disabled' : ''}>Previous</button>
//           <button onclick="changeLeaderboardPage(${pagination.currentPage + 1})" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>Next</button>
//       `;
//       leaderBoardEle.appendChild(paginationInfo);
//   };
//   document.getElementById('message').appendChild(inputElement);
// }

// async function changeLeaderboardPage(pageNumber) {
//   const token = localStorage.getItem('token');
//   const rowsPerPage = 2;
  
//   const leaderboardResponse = await axios.get(`http://localhost:3000/premium/showLeaderBoard?page=${pageNumber}&limit=${rowsPerPage}`, {
//       headers: { "Authorization": token }
//   });

//   const leaderboardArray = leaderboardResponse.data.leaderboard;
//   const leaderBoardEle = document.getElementById('leaderboard');
//   leaderBoardEle.innerHTML = '<h1>Leader Board</h1>';
  
//   leaderboardArray.forEach((userDetails) => {
//       leaderBoardEle.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.totalExpenses || 0}</li>`;
//   });

//   const paginationInfo = document.createElement('div');
//   const { pagination } = leaderboardResponse.data;
//   paginationInfo.innerHTML = `
//       <p>Page ${pagination.currentPage} of ${pagination.totalPages}</p>
//       <button onclick="changeLeaderboardPage(${pagination.currentPage - 1})" ${pagination.currentPage <= 1 ? 'disabled' : ''}>Previous</button>
//       <button onclick="changeLeaderboardPage(${pagination.currentPage + 1})" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>Next</button>
//   `;
//   leaderBoardEle.appendChild(paginationInfo);
// }

function showleaderboard() {
  const inputElement = document.createElement('input');
  inputElement.type = "button";
  inputElement.value = "Show Leaderboard";
  inputElement.id = "showLeaderboardButton"; // Add an ID for easy access

  inputElement.onclick = async () => {
      const token = localStorage.getItem('token');
      let currentPage = 1; // Initialize here
      const rowsPerPage = parseInt(localStorage.getItem('rowsPerPage'), 10) || 2; // Use stored rowsPerPage or default

      try {
          const leaderboardResponse = await axios.get(`http://localhost:3000/premium/showLeaderBoard?page=${currentPage}&limit=${rowsPerPage}`, {
              headers: { "Authorization": token }
          });

          displayLeaderboard(leaderboardResponse.data); // Call a separate display function

      } catch (error) {
          console.error("Error fetching leaderboard:", error);
          // Handle error, maybe display a message to the user
          const leaderBoardEle = document.getElementById('leaderboard');
          leaderBoardEle.innerHTML = "<p>Error fetching leaderboard. Please try again later.</p>";
      }
  };
  document.getElementById('message').appendChild(inputElement);
}

// Separate function to display and update the leaderboard
function displayLeaderboard(leaderboardData) {
  const leaderboardArray = leaderboardData.leaderboard;
  const leaderBoardEle = document.getElementById('leaderboard');
  leaderBoardEle.innerHTML = '<h1>Leader Board</h1>';

  leaderboardArray.forEach((userDetails) => {
      leaderBoardEle.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.totalExpenses || 0}</li>`;
  });

  const paginationInfo = document.createElement('div');
  const { pagination } = leaderboardData;
  paginationInfo.innerHTML = `
      <p>Page ${pagination.currentPage} of ${pagination.totalPages}</p>
      <button onclick="changeLeaderboardPage(${pagination.currentPage - 1})" ${pagination.currentPage <= 1 ? 'disabled' : ''}>Previous</button>
      <button onclick="changeLeaderboardPage(${pagination.currentPage + 1})" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>Next</button>
  `;
  leaderBoardEle.appendChild(paginationInfo);
}


async function changeLeaderboardPage(pageNumber) {
  const token = localStorage.getItem('token');
  const rowsPerPage = parseInt(localStorage.getItem('rowsPerPage'), 10) || 2;

  try {
      const leaderboardResponse = await axios.get(`http://localhost:3000/premium/showLeaderBoard?page=${pageNumber}&limit=${rowsPerPage}`, {
          headers: { "Authorization": token }
      });
      displayLeaderboard(leaderboardResponse.data);
  } catch (error) {
      console.error("Error fetching leaderboard page:", error);
      const leaderBoardEle = document.getElementById('leaderboard');
      leaderBoardEle.innerHTML = "<p>Error fetching leaderboard. Please try again later.</p>";
  }
}

// Function to display a message for premium users
function showPremiumUserMessage() {
  document.getElementById('rzp-button1').style.visibility = "hidden";
  document.getElementById('message').innerHTML = "You Are a Premium User";
}

// Function to parse JWT and extract data
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

// Function to display downloaded content
function displayDownloadedContent() {
  const token = localStorage.getItem('token');
  const currentPage = 1;
  const rowsPerPage = 2;

  axios.get(`http://localhost:3000/expenses/downloaded-content?page=${currentPage}&limit=${rowsPerPage}`, {
      headers: { "Authorization": token }
  })
  .then(response => {
      const downloadedList = document.getElementById('downloadedList');
      downloadedList.innerHTML = '';

      response.data.downloadedContents.forEach(content => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<a href="${content.url}" target="_blank">${content.filename}</a>`;
          downloadedList.appendChild(listItem);
      });

      // Pagination controls
      const paginationInfo = document.createElement('div');
      const { pagination } = response.data;
      paginationInfo.innerHTML = `
          <p>Page ${pagination.currentPage} of ${pagination.totalPages}</p>
          <button onclick="changeDownloadedContentPage(${pagination.currentPage - 1})" ${pagination.currentPage <= 1 ? 'disabled' : ''}>Previous</button>
          <button onclick="changeDownloadedContentPage(${pagination.currentPage + 1})" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>Next</button>
      `;
      downloadedList.appendChild(paginationInfo);
  })
  .catch(error => console.log(error));
}

async function changeDownloadedContentPage(pageNumber) {
  const token = localStorage.getItem('token');
  const rowsPerPage = 2;

  axios.get(`http://localhost:3000/expenses/downloaded-content?page=${pageNumber}&limit=${rowsPerPage}`, {
      headers: { "Authorization": token }
  })
  .then(response => {
      const downloadedList = document.getElementById('downloadedList');
      downloadedList.innerHTML = '';

      response.data.downloadedContents.forEach(content => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<a href="${content.url}" target="_blank">${content.filename}</a>`;
          downloadedList.appendChild(listItem);
      });

      // Pagination controls
      const paginationInfo = document.createElement('div');
      const { pagination } = response.data;
      paginationInfo.innerHTML = `
          <p>Page ${pagination.currentPage} of ${pagination.totalPages}</p>
          <button onclick="changeDownloadedContentPage(${pagination.currentPage - 1})" ${pagination.currentPage <= 1 ? 'disabled' : ''}>Previous</button>
          <button onclick="changeDownloadedContentPage(${pagination.currentPage + 1})" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>Next</button>
      `;
      downloadedList.appendChild(paginationInfo);
  })
  .catch(error => console.log(error));
}

// Function to handle payment for premium membership
document.getElementById('rzp-button1').onclick = async function (e) {
  const token = localStorage.getItem('token');
  const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token } });

  const options = {
      "key": response.data.key_id,
      "order_id": response.data.order.id,
      "handler": async function (response) {
          const res = await axios.post("http://localhost:3000/purchase/updatetransactionstatus", {
              order_id: options.order_id,
              payment_id: response.razorpay_payment_id,
          }, { headers: { "Authorization": token } });

          alert('You are a premium user now!');
          document.getElementById('rzp-button1').style.visibility = "hidden";
          document.getElementById('message').innerHTML = "You Are a Premium User";
          localStorage.setItem('token', res.data.token);
          //showleaderboard();
          //changeLeaderboardPage(1);
      }
  };

  const rzp1 = new Razorpay(options);
  rzp1.open();
  e.preventDefault();

  rzp1.on('payment.failed', function (response) {
      console.log(response);
      alert('Something went wrong');
  });
};

// Event listener to change rows per page
document.getElementById('rowsperpage').addEventListener('change', (event) => {
  const selectedRows = event.target.value;
  localStorage.setItem('rowsPerPage', selectedRows);
  reloadExpenses();
});

// Display expenses when the page loads
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem('token');
  const decodedToken = parseJwt(token);
  const isPremiumUser = decodedToken.isPremium;

  if (isPremiumUser) {
      showPremiumUserMessage();
      showleaderboard();
      //changeLeaderboardPage(1);
      document.getElementById('leaderboard').innerHTML = "";
      displayDownloadedContent();
      changeDownloadedContentPage(1);
      document.getElementById('filter-options').style.display = 'block';
      document.getElementById('downloadexpense').style.display = 'block';
      let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage'), 10) || 2;
      let currentPage = 1;
      filterExpenses('monthly', currentPage, rowsPerPage);
  } else {
      displayDownloadedContent();
      changeDownloadedContentPage(1);
      document.getElementById('message').innerHTML = "Upgrade to Premium to access these features.";
      document.getElementById('filter-options').style.display = 'none';
      document.getElementById('downloadexpense').style.display = 'block';
      let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage'), 10) || 2;
      let currentPage = 1;
      fetchAndDisplayExpenses(currentPage, rowsPerPage);
  }

  document.addEventListener('click', async (event) => {
    if (event.target.id === 'downloadexpense') {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get('http://localhost:3000/expenses/download', {
            headers: { "Authorization": token }
          });
    
          if (response.status === 200 && response.data.success) {
            // The backend sends the download link
            const fileUrl = response.data.fileUrl;
            window.open(fileUrl);
            // var a = document.createElement("a");
            // a.href = fileUrl;
            // a.download = 'Expense.csv'; // Change the filename as needed
            // a.click();
          } else {
            throw new Error(response.data.message || 'Error downloading file');
          }
        } catch (err) {
          showError(err);
        }
    }
  });
});

// Function to filter expenses by range
function filterExpenses(range, page = 1, rowsPerPage = 2) {
  const token = localStorage.getItem('token');
  axios.get(`http://localhost:3000/expenses/date-range?range=${range}&page=${page}&limit=${rowsPerPage}`, {
      headers: { "Authorization": token }
  })
  .then(response => {
      const { expenses, pagination } = response.data;
      const expenseList = document.getElementById('expenseList');
      expenseList.innerHTML = '';

      expenses.forEach(expense => {
          const expenseItem = document.createElement("li");
          expenseItem.dataset.expenseId = expense._id;
          expenseItem.dataset.amount = expense.amount;
          expenseItem.dataset.description = expense.description;
          expenseItem.dataset.category = expense.category;

          expenseItem.innerHTML = `${expense.amount} - ${expense.description} - ${expense.category}
              <button class="delete-button" onclick="deleteExpense('${expense._id}')">Delete</button>
              <button class="edit-button" onclick="editExpense('${expense._id}', '${expense.amount}', '${expense.description}', '${expense.category}')">Edit</button>`;
          expenseList.appendChild(expenseItem);
      });

      const paginationInfo = document.getElementById('paginationInfo');
      paginationInfo.innerHTML = `
          <p>Page ${pagination.currentPage} of ${pagination.totalPages}</p>
          <button onclick="filterExpenses('${range}', ${pagination.currentPage - 1}, ${rowsPerPage})" ${pagination.currentPage <= 1 ? 'disabled' : ''}>Previous</button>
          <button onclick="filterExpenses('${range}', ${pagination.currentPage + 1}, ${rowsPerPage})" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>Next</button>
      `;
  })
  .catch(error => console.log(error));
}


reloadExpenses();

function profile(){
  window.location.href = "../../profile/index.html";
}

function logout() {
  localStorage.clear();
  window.location.href = "http://localhost:3000";
}