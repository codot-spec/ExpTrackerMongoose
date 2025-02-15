let isEditing = false;
let form;

document.addEventListener('DOMContentLoaded', () => {
    form = document.getElementById('form');

    if (form) {
        const urlParams = new URLSearchParams(window.location.search);
        const expenseIdFromUrl = urlParams.get('id');

        if (expenseIdFromUrl) {
            isEditing = true;
            const { expenseId, amount, description, category } = getUrlParams();
            document.getElementById('amount').value = amount;
            document.getElementById('description').value = description;
            document.getElementById('category').value = category;
            form.dataset.expenseId = expenseId;
        }

        form.addEventListener('submit', handleFormSubmit);
    } else {
        console.error("Form element not found!");
    }
});

function handleFormSubmit(event) {
    event.preventDefault();

    if (!form) { 
        console.error("Form not found. Cannot submit.");
        return;
    }

    const expenseDetails = {
        amount: parseFloat(event.target.amount.value),
        description: event.target.description.value,
        category: event.target.category.value
    };
    
    if (isNaN(expenseDetails.amount) || expenseDetails.amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
console.log(expenseDetails)
    const token = localStorage.getItem('token');
    const expenseId = form.dataset.expenseId;

    if (expenseId) {
        axios.put(`http://localhost:3000/expenses/${expenseId}`, expenseDetails, { headers: { "Authorization": token } })
            .then(response => {
                window.location.href = "../Expense-list/expense.html";
            })
            .catch(error => {
                console.error("Error updating expense:", error);
                alert("Error updating expense. Please try again.");
            });
    } else {
        axios.post("http://localhost:3000/expenses", expenseDetails, { headers: { "Authorization": token } })
        .then(response => {
          if (response.data.success) {
            console.log("Expense added successfully:", response.data.message);
            window.location.href = "../Expense-list/expense.html";
          } else {
            console.error("Server reported an error:", response.data.message || "Unknown error");
            alert("Error adding expense: " + (response.data.message || "Please try again."));
          }
        })
        .catch(error => {
          console.error("Error adding expense:", error.response ? error.response.data : error);
          alert("Error adding expense. Please try again.");
        });
    
    }

    event.target.reset();
    delete form.dataset.expenseId;
}

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const expenseId = decodeURIComponent(urlParams.get('id'));
    const amount = decodeURIComponent(urlParams.get('amount'));
    const description = decodeURIComponent(urlParams.get('description'));
    const category = decodeURIComponent(urlParams.get('category'));
    return { expenseId, amount, description, category };
}

function profile(){
    window.location.href = "../../profile/index.html";
  }
  
function logout() {
    localStorage.clear();
    window.location.href = "http://localhost:3000";
  }
