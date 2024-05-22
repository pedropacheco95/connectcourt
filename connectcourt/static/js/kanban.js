// Get all ticket elements
const tickets = document.querySelectorAll('.ticket');

// Add event listeners for drag and drop functionality
tickets.forEach(ticket => {
    ticket.addEventListener('dragstart', handleDragStart);
    ticket.addEventListener('dragend', handleDragEnd);
});

// Get all ticket list elements
const kanbanColumns = document.querySelectorAll('.kanban-column');

// Add event listeners for drag and drop functionality
kanbanColumns.forEach(kanbnaColumn => {
    kanbnaColumn.addEventListener('dragover', handleDragOver);
    kanbnaColumn.addEventListener('dragenter', handleDragEnter);
    kanbnaColumn.addEventListener('dragleave', handleDragLeave);
    kanbnaColumn.addEventListener('drop', handleDrop);
});

// Drag and Drop event handlers
function handleDragStart(e) {
    this.style.opacity = '0.4'; // Make the dragged ticket semi-transparent
    e.dataTransfer.setData('text/plain', this.dataset.ticket_id); // Store the ticket's ID for later retrieval
}

function handleDragEnd() {
    this.style.opacity = '1'; // Restore the dragged ticket's opacity
}

function handleDragOver(e) {
    e.preventDefault(); // Allow the drop event to occur
}

function handleDragEnter(e) {
    this.classList.add('over'); // Add a class to the ticket list when a ticket is dragged over it (for optional styling)
}

function handleDragLeave() {
    this.classList.remove('over'); // Remove the class when the ticket is dragged out of the ticket list
}

function handleDrop(e) {
    e.preventDefault(); // Prevent the browser's default drop handling
    this.classList.remove('over'); // Remove the class when the ticket is dropped into the ticket list

    const ticketId = e.dataTransfer.getData('text/plain'); // Get the stored ticket ID
    const ticket = document.querySelector(`[data-ticket_id="${ticketId}"]`); // Find the ticket element by its ID

    if (ticket) {
        this.querySelector('.ticket-list').appendChild(ticket); // Append the ticket element to the new ticket list
    }
}