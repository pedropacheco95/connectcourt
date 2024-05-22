window.addEventListener('load', loadHandler);
function loadHandler(){
    setupCalendar();
    getPlayers();
}

function setupCalendar() {
    const today = new Date();
    const todayDayOfWeek = today.getDay(); 
    const tbody = document.querySelector('table tbody');

    for (let hour = 7; hour <= 14; hour++) { 
        const row = tbody.insertRow();
        const timeCell = row.insertCell();
        timeCell.textContent = `${hour}:00`;
        timeCell.className = 'time-cell';

        for (let i = 0; i < 7; i++) {
            const dayCell = row.insertCell();
            dayCell.onclick = function() { openEventModal(this, hour, i); };
        }
    }
}

function openEventModal(cell, hour, dayIndex) {
    modal = document.getElementById('calendar_modal');
    openModal(modal);
    modal.currentCell = cell;
    modal.startHour = hour;
    modal.dayIndex = dayIndex;
}

function saveEvent() {
    var modal = document.getElementById("calendar_modal");
    var eventTitle = document.getElementById("eventTitle").value;
    var duration = parseInt(document.getElementById("eventDuration").value);
    var startHour = modal.startHour;
    var dayIndex = modal.dayIndex;

    console.log('modal.currentCell',modal.currentCell)
    console.log('eventTitle',eventTitle)
    console.log('duration',duration)
    if (modal.currentCell && eventTitle && duration) {
        var tbody = document.querySelector('table tbody');
        var eventDiv = document.createElement('div');
        eventDiv.className = 'event-block';
        eventDiv.innerText = eventTitle;
        eventDiv.style.height = `${60 * duration - 2}px`; // Adjust height based on duration

        // Calculate the starting cell and apply the event div
        for (let i = 0; i < duration; i++) {
            var targetCell = tbody.rows[startHour - 7 + i].cells[dayIndex + 1];
            if (i === 0) {
                targetCell.appendChild(eventDiv);
            }
        }
    }
    modal.style.display = "none"; // Hide the modal
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDuration").value = "";
}

function getPlayers(){
    let model_name = 'Player';
    players_div = document.getElementById('players_div')
    customGetJSON(`/api/query/${model_name}` , function(data) {
        console.log(data)
        for (let option of data) {
            var eventDiv = document.createElement('div');
            eventDiv.className = 'player-block';
            eventDiv.innerText = option.name;
            players_div.appendChild(eventDiv);
        }
    });
}