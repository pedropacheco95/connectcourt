document.addEventListener('DOMContentLoaded', (event) => {
    const draggableRows = document.querySelectorAll('.drag_to_delete');
  
    draggableRows.forEach(row => {
      createDraggableRows(row)
    });
});
  
function createDraggableRows(row){
    let startX;
    let currentX;
    let isDragging = false;
  
    const startDrag = (clientX) => {
      
      isDragging = true;
      startX = clientX;
      currentX = 0;
      row.classList.add('is-dragging');
    };
  
    const onDrag = (clientX) => {
      if (!isDragging) return;
      currentX = clientX - startX;
      if (currentX < -10) {
          currentX = -210;
      } else if (currentX > 0) {
          currentX = 0;
      }
      // Apply the opposite transform to the trash icon to keep it in view
      row.querySelector('.trash').style.transform = `translateX(${100 + currentX}%)`;
    };
  
    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
    };
  
    const handleScroll = (e) => {
      const isHorizontalScroll = Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY) || Math.abs(e.deltaX) > Math.abs(e.deltaY);
      
      if (isHorizontalScroll) {
        e.preventDefault();
      
        const scrollDirection = e.wheelDeltaX < 0 || e.deltaX > 0 ? -1 : 1;
        const trashIconPosition = scrollDirection * 110;
        row.querySelector('.trash').style.transform = `translateX(${trashIconPosition}%)`;
      }
    };
    
    // Mouse events
    row.addEventListener('mousedown', (e) => startDrag(e.clientX));
    document.addEventListener('mousemove', (e) => onDrag(e.clientX));
    document.addEventListener('mouseup', (e) => endDrag(e));
  
    // Touch events
    row.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX));
    document.addEventListener('touchmove', (e) => onDrag(e.touches[0].clientX));
    document.addEventListener('touchend', (e) => endDrag(e));
  
    //Scroll events
    row.addEventListener('wheel', handleScroll); 
  
    row.querySelector('.trash').addEventListener('click', (e) => {
      modalActivator = row.getElementsByClassName('playerField')[0];
      switchPlayer('no_player')
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function incrementNumber(input_name) {
  var inputFields = document.getElementsByName(input_name);
  if (inputFields.length > 0) {
      var inputField = inputFields[0];
      var currentValue = parseInt(inputField.value, 10);
      currentValue = isNaN(currentValue) ? 0 : currentValue;
      inputField.value = currentValue + 1;
      if (inputField.value) {
          inputField.focus();
      }
      var event = new Event('change', { bubbles: true });
      inputField.dispatchEvent(event);
  }
}

function decreaseNumber(input_name) {
  var inputFields = document.getElementsByName(input_name);
  if (inputFields.length > 0) {
      var inputField = inputFields[0];
      var currentValue = parseInt(inputField.value, 10);
      currentValue = isNaN(currentValue) ? 1 : currentValue;
      inputField.value = Math.max(0, currentValue - 1);
      if (inputField.value) {
          inputField.focus();
      }
      var event = new Event('change', { bubbles: true });
      inputField.dispatchEvent(event);
  }
}