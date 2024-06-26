//Commission Base
let commissions = document.getElementById('commissions');
let commissionId = document.getElementById('commission-id');

//Text Inputs from User (TextBoxes)
let titleInput = document.getElementById('title');
let descInput = document.getElementById('desc');
let titleEditInput = document.getElementById('title-edit');
let descEditInput = document.getElementById('desc-edit');

//Date Input
let dateStarted;
let dateEdit;

//Commission Status from User (Dropdown Box Selection)
let statusChoice; //The Text Status
let barPercent; //The width of the progress Bar
let barColor; //The color of the progress bar

let statusEdit;
let percentEdit;
let colorEdit;

let checkbox = document.getElementById("checkbox-id");

//Data/API
let data = [];
let selectedCommission = {};
const api = 'http://127.0.0.1:8000';

let deleteList = [];

function tryAdd() {
  let msg = document.getElementById('msg');
  msg.innerHTML = '';
}

// This stuff automically sets the default values for a new commission 
document.getElementById('addNew').addEventListener('click', () => {

  
  playButtonClickSound();
  
  // Reset the name and description fields to blank
  titleInput.value = '';
  descInput.value = '';

  // Reset the commission status dropdown to its default value
  document.getElementById('dropdownAdd').innerText = 'Select a status';
  statusChoice = undefined;

  // Set the date input to today's date
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
  document.getElementById('myDate').value = formattedDate;
  // Set dateStarted to today's date
  dateStarted = formattedDate;
});

// Function to play the "pick1.wav" sound effect
function playButtonClickSound() {
  const audioElement = new Audio('SFX/pick1.wav');
  audioElement.play();
}

//MONGODB THINGS
// Function to fetch commissions from the backend
async function getCommissions() {
  try {
    const response = await fetch(`${api}/commissions`);
    if (!response.ok) {
      throw new Error('Failed to fetch commissions');
    }
    const commissions = await response.json();
    data = commissions.commissions;
    refreshCommissions();
  } catch (error) {
    console.error('Error fetching commissions:', error);
  }
}


// Function to refresh commissions on the UI
function refreshCommissions() {
  commissions.innerHTML = '';
  Array.from(data).forEach((x) => {
    commissions.innerHTML += `
      <div id="commission-${x._id}">
        <span class="fw-bold fs-4">${x.title}</span>
        <pre class="text-secondary ps-12">${x.description}</pre>
        <span class="fs-6">Date Started: ${x.date}</span>
        <span class="fw-bold fs-5.2">${x.status}</span>
        <div id="myProgress">
          <span id="myBarStored" style="width: ${x.width}%; background-color: ${x.color};"></span>
        </div>
        <span class="options">
          <i onClick="tryEditCommission('${x._id}')" data-bs-toggle="modal" data-bs-target="#modal-edit" class="fas fa-edit"></i>
          <input type="checkbox" onClick = "addDel('${x._id}')" class="commission-checkbox" id="checkbox-${x._id}">
          <i onClick="deleteCommission('${x._id}')" class="fas fa-trash-alt"></i>
        </span>
      </div>
    `;
  });
  resetForm();
}


async function addDel(id)
{
  const comm = data.find(obj => obj._id === id);
  deleteList.push(comm);
}

async function Delete()
{
  for(i = 0; i< deleteList.length; i++)
    {
      id = deleteList[i]._id;
      deleteCommission(id);
    }
    deleteList = [];
};

async function tryEditCommission(id) {
  // Find the commission with the specified ID
  const commission = data.find(obj => obj._id === id);

  // Populate the modal with the commission details
  document.getElementById('title-edit').value = commission.title;
  document.getElementById('desc-edit').value = commission.description;
  document.getElementById('myDateUpdate').value = commission.date;
  document.getElementById('dropdownEdit').innerText = commission.status;
  
  const myBarEdit = document.getElementById("myBarEdit");
  myBarEdit.style.width = commission.width + '%';
  myBarEdit.style.backgroundColor = commission.color;

  // Set the commission ID in the modal title
  document.getElementById('commission-id').textContent = id;
}

  // Add event listener for the form submission
  const formEdit = document.getElementById('form-edit');
  formEdit.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const selectedStatus = document.getElementById('dropdownEdit').innerText.trim();

    const id = document.getElementById('commission-id').textContent;

    const updatedCommission = {
      title: document.getElementById('title-edit').value,
      description: document.getElementById('desc-edit').value,
      status: selectedStatus,
      width: document.getElementById('myBarEdit').style.width.replace('%', ''),
      color: document.getElementById('myBarEdit').style.backgroundColor,
      date: document.getElementById('myDateUpdate').value,
    };

    try {
      // Send a PUT request to update the commission in the database
      const response = await fetch(`/commissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCommission),
      });

      if (!response.ok) {
        throw new Error('Failed to update commission');
      }

      // Refresh the commissions list after updating
      getCommissions();
      refreshCommissions();
    } catch (error) {
      console.error('Error updating commission:', error);
      // Handle error
    }
  });

  function editCommission(id){
    tryEditCommission(id);
  }


// Function to get status text based on option key
function getStatusText(option) {
  const optionChoice = {
    A: 'Paid / Starting', 
    B: 'Sketch Completed', 
    C: 'Lineart Completed',  
    D: 'Coloring Completed', 
    E: 'Completed', 
  };
  return optionChoice[option] || 'Select a status';
}

// Function to delete a commission
async function deleteCommission(id) {
  try {
    const response = await fetch(`${api}/commissions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete commission');
    }
    data = data.filter((x) => x._id !== id);
    refreshCommissions();
  } catch (error) {
    console.error('Error deleting commission:', error);
  }
}


// Function to reset form inputs
function resetForm() {
  titleInput.value = '';
  descInput.value = '';
  statusChoice = undefined;
  barPercent = '0';
  barColor = 'gray';
}

// Initialize by fetching commissions
getCommissions();

//Listen for Date Selection
document.getElementById('myDate').addEventListener('change', function(event) {
  dateStarted = event.target.value;
});

//Listen for Date Selection - Edit/Update Modal
document.getElementById('myDateUpdate').addEventListener('change', function(event) {
  dateEdit = event.target.value;
});

// Listen for User Selection for Commission Status
document.querySelector('[aria-labelledby="dropdownAdd"]').addEventListener('click', (e) => {
  //Add Commission: Modal Version
  if (e.target.classList.contains('dropdown-item') && e.target.getAttribute('key') === '1') {
    statusChoice = e.target.innerText; 

    let value = e.target.getAttribute('value');

  const progressBarWidths = {
    1: "15", 
    2: "25", 
    3: "50",
    4: "75",
    5: "100"    
  };

  const colorMap = {
    1: "red",
    2: "yellow",
    3: "teal",
    4: "blue",
    5: "green"
  };

  barPercent = progressBarWidths[value];
  barColor = colorMap[value];
}
});

document.getElementById('form-add').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!titleInput.value) {
    document.getElementById('msg').innerHTML = 'Commission title cannot be blank';
  } else if (statusChoice === undefined) {
    document.getElementById('msg').innerHTML = 'Commission status cannot be blank';
  } else {
    if (dateStarted === undefined || dateStarted === '') {
      dateStarted = "N/A, Payment Received";
    }

    const commissionData = {
      title: titleInput.value,
      description: descInput.value,
      status: statusChoice,
      width: barPercent,
      color: barColor,
      date: dateStarted
    };

    try {
      const response = await fetch(`${api}/commissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commissionData)
      });

      if (!response.ok) {
        throw new Error('Failed to add commission');
      }
      getCommissions();
      refreshCommissions();

      // Close Modal
      let add = document.getElementById('add');
      add.setAttribute('data-bs-dismiss', 'modal');
      add.click();
      (() => {
        add.setAttribute('data-bs-dismiss', '');
      })();

      // Reset the Text and Progress Bar
      document.getElementById('dropdownAdd').innerHTML = "Select a status";
      const myBar = document.getElementById("myBar");
      myBar.style.width = 0;
      myBar.style.backgroundColor = "gray";
      const dateInput = document.getElementById('myDate');
      dateInput.value = '';
      dateStarted = undefined;
    } catch (error) {
      console.error('Error adding commission:', error);
    }
  }
});

//BAR STUFF
//Add Modal Functions
function updateText(option) {
  const dropdownButton = document.getElementById("dropdownAdd");

  const optionChoice = {
    A: 'Paid / Starting', 
    B: 'Sketch Completed', 
    C: 'Lineart Completed',  
    D: 'Coloring Completed', 
    E: 'Completed', 
  };

  dropdownButton.innerText = optionChoice[option];
  updateProgressBar(option);
}


function updateProgressBar(option) {
  const myBar = document.getElementById("myBar");
  const progressBarWidths = {
      A: "15%", 
      B: "25%", 
      C: "50%",
      D: "75%",
      E: "100%"  
  };

  const targetWidth = parseFloat(progressBarWidths[option]);
  let currentWidth = parseFloat(myBar.style.width) || 0;

  const widthDifference = currentWidth - targetWidth;

  const animationDuration = 1000;
  const animationSteps = 100;
  const stepDuration = animationDuration / animationSteps;

  let stepCount = 0;
  const animationInterval = setInterval(() => {
    if (stepCount < animationSteps) {
      const progress = squashSquishEasing(stepCount / animationSteps);
      const newWidth = currentWidth - (widthDifference * progress);
      myBar.style.width = newWidth + '%';
      stepCount++;
    } else {
      clearInterval(animationInterval);
    }
  }, stepDuration);
  
  // Set the width and color based on the selected option
  myBar.style.width = progressBarWidths[option];
  myBar.style.backgroundColor = getBackgroundColor(option);
}

function getBackgroundColor(option) {
  // Define color mappings based on options (you can customize this)
  const colorMap = {
      A: "red",
      B: "yellow",
      C: "teal",
      D: "blue",
      E: "green"
  };

  return colorMap[option] || "gray"; // Default to gray if option not found
}


//Edit Modal Functions
function updateTextEdit(option) {
  const dropdownButton = document.getElementById("dropdownEdit");

  const optionChoice = {
    A: 'Paid / Starting', 
    B: 'Sketch Completed', 
    C: 'Lineart Completed',  
    D: 'Coloring Completed', 
    E: 'Completed', 
  };

  dropdownButton.innerText = optionChoice[option];
  updateProgressBar2(option);
}

//Progress Bar in Edit/Update Modal
function updateProgressBar2(option) {
  const myBar = document.getElementById("myBarEdit");
  const progressBarWidths = {
    A: "15%", 
    B: "25%", 
    C: "50%",
    D: "75%",
    E: "100%"  
};

const targetWidth = parseFloat(progressBarWidths[option]);
let currentWidth = parseFloat(myBar.style.width) || 0;

const widthDifference = currentWidth - targetWidth;

const animationDuration = 1000;
const animationSteps = 100;
const stepDuration = animationDuration / animationSteps;

let stepCount = 0;
const animationInterval = setInterval(() => {
  if (stepCount < animationSteps) {
    const progress = squashSquishEasing(stepCount / animationSteps);
    const newWidth = currentWidth - (widthDifference * progress);
    myBar.style.width = newWidth + '%';
    stepCount++;
  } else {
    clearInterval(animationInterval);
  }
}, stepDuration);
  // Set the width and color based on the selected option
  myBar.style.width = progressBarWidths[option];
  myBar.style.backgroundColor = getBackgroundColor(option);
}

function getBackgroundColor(option) {
  // Define color mappings based on options (you can customize this)
  const colorMap = {
      A: "red",
      B: "yellow",
      C: "teal",
      D: "blue",
      E: "green"
  };

  return colorMap[option] || "gray"; // Default to gray if option not found
}

function squashSquishEasing(t) {
  return (Math.cos((t * Math.PI) + Math.PI) + 1) / 2;
}
