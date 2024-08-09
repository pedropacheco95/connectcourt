document.addEventListener('click', function(event) {
    let hideIfClickOutside = document.getElementsByClassName('hide_if_click_outside');
    for (let elementToHide of hideIfClickOutside) {
        if (elementToHide.classList.contains('just_added')){
            elementToHide.classList.remove('just_added');
            continue;
        }
        else if (event.target != elementToHide && !elementToHide.contains(event.target)) {
            elementToHide.style.display = 'none';
            elementToHide.classList.remove('hide_if_click_outside');
        }
    }
});

window.addEventListener('load', function () {
    var loader = document.getElementById('loading-overlay');
    setTimeout(function() {
        loader.style.display = 'none';
    }, 500);
});


function duplicateElement(element){
    var newElement = element.cloneNode(true);
    element.parentNode.insertBefore(newElement, element.nextSibling);
}

function duplicateInputElement(element){
    var newElement = element.cloneNode(true);
    newElement.value = ""
    element.parentNode.insertBefore(newElement, element.nextSibling);
}

function linkToDatasetHref(element){
    window.location.href = element.dataset.href;
}

function addOrRemoveClass(element_selector, className){
    var elements = document.querySelectorAll(element_selector);
    if (elements){
        for (let element of elements){
            if (element.classList.contains(className)){
                element.classList.remove(className);
            } else {
                element.classList.add(className);
            }
        }
    }
}

function setFocus(on, element, focus_element) {
    if (!element.readOnly){
        if (on) {
            setTimeout(function () {
                focus_element.classList.add("focus");
            });
        } else {
            if (element.value == "") {
                focus_element.classList.remove("focus");
            }
        }
    }
}

function showHidePassword(element) {
    let passwordInput = element.parentNode.getElementsByTagName("input")[0];
    let icon = element.getElementsByTagName("i")[0];
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = 'password';
        icon.classList.remove("fa-eye-slash");
    }
}

function validateForm(form){
    var inputs = form.querySelectorAll("input");
    var valid = true;
    for (let input of inputs){
        if (input.value == "" && input.classList.contains("needs-validation")){
            valid = false;
            if (!input.classList.contains("is-invalid")){
                input.classList.add("is-invalid");
                let label = input.parentNode.querySelector("label")
                if (label){
                    label.classList.add("label-invalid");
                }
            }
        } else {
            if (!input.classList.contains("is-valid")){
                input.classList.add("is-valid");
                if (input.parentNode.classList.contains("for_color")){
                    input.parentNode.classList.add("validated_color_field")
                }
                let label = input.parentNode.querySelector("label")
                if (label){
                    label.classList.add("label-valid");
                }
            }
        }
    }
    return valid;
}

function showHideElement(element_id){
    let elementToHide = document.getElementById(element_id)
    if (elementToHide.style.display === "none") {
        elementToHide.style.display = "block";
        elementToHide.classList.add('hide_if_click_outside')
        elementToHide.classList.add('just_added')
    } else {
        elementToHide.style.display = "none";
    }
}

function showHideElementByClass(element_class){
    let elements = document.getElementsByClassName(element_class)
    for (let element of elements){
        if (element.style.display === "none") {
            element.style.display = "";
        } else {
            element.style.display = "none";
        }
    }
}

function searchTable(input) {
    var matchCount = 0;
    var filter = input.value.toUpperCase();
    var table = document.getElementById(input.dataset.table_id);
    var rows = table.getElementsByTagName("tr");
    for (var i = 1; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName("td");
        var match = false;
        for (var j = 0; j < cells.length; j++) {
            if (cells[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
                match = true;
                break;
            }
        }
        if (match) {
            rows[i].style.display = "";
            matchCount++;
        } else {
            rows[i].style.display = "none";
        }
    }
    if (matchCount === 0) {
        var noMatchRow = table.insertRow(-1);
        var noMatchCell = noMatchRow.insertCell(0);
        noMatchCell.colSpan = rows[0].cells.length;
        noMatchCell.innerHTML = "Não há elementos que correspondam à pesquisa.";
    } else {
        var noMatchRow = table.getElementsByTagName("tr")[table.rows.length - 1];
        if (noMatchRow && noMatchRow.cells.length === 1) {
            table.deleteRow(-1);
        }
    }
}

function sortTable(header,columnIndex) {
    var table = header.parentNode.parentNode.parentNode;
    var rows = Array.from(table.tBodies[0].rows);
    var headerCells = table.querySelectorAll("th");
    columnIndex = parseInt(columnIndex)-1;
    // Toggle the sort order for the clicked column
    var sortOrder = headerCells[columnIndex].classList.toggle('sort-order') ? 1 : -1;
    
    // Reset the sort order for the other columns
    headerCells.forEach(function(cell, index) {
        if (index !== columnIndex) {
            cell.classList.remove('sort-order');
        }
    });
    
    // Sort the table rows
    rows.sort(function(a, b) {
        var cellA = a.cells[columnIndex].textContent.toUpperCase();
        var cellB = b.cells[columnIndex].textContent.toUpperCase();
        if (cellA < cellB) {
            return -1 * sortOrder;
        } else if (cellA > cellB) {
            return 1 * sortOrder;
        } else {
            return 0;
        }
    });
    
    // Update the table with the sorted rows
    rows.forEach(function(row) {
        table.tBodies[0].appendChild(row);
    });
    
    // Update the sort indicator and remove the other indicators
    headerCells.forEach(function(cell, index) {
        var indicator = cell.querySelector('.sort-indicator');
        indicator.classList.remove('indicator-up', 'indicator-down');
    });

    var indicator = headerCells[columnIndex].querySelector('.sort-indicator');
    if (sortOrder == -1){
        indicator.classList.add('indicator-down');
        indicator.classList.remove('indicator-up');
    }
    else{
        indicator.classList.add('indicator-up');
        indicator.classList.remove('indicator-down');
    }
}

function switchTab(element){
    if (element.classList.contains('active_tab_title')){
        return;
    };
    // Remove active tab
    let active_tab = document.querySelector(".active_tab_title");
    let active_tab_content = document.getElementById(active_tab.dataset.tab_id);
    active_tab.classList.remove("active_tab_title");
    active_tab_content.classList.add("inactive_tab_content");

    let tab = document.getElementById(element.dataset.tab_id);
    tab.classList.remove("inactive_tab_content");
    element.classList.add("active_tab_title");
}

function removeAllReadonlys(){
    let inputs = document.querySelectorAll("input");
    for (let input of inputs){
        input.removeAttribute("readonly");
        input.classList.add("was_readonly_input");
    }
    let disabled_inputs = document.querySelectorAll(".disabled_input");
    for (let input of disabled_inputs){
        input.removeAttribute("disabled");
        input.classList.add("was_disabled_input");
    }
    let header = document.querySelector(".readonly_header");
    if (header){
        header.classList.remove("readonly_header");
        header.classList.add("was_readonly_header");
    }
    let imagesContainers = document.querySelectorAll(".readonly_image_input");
    for (let container of imagesContainers){
        container.classList.remove("readonly_image_input");
        container.classList.add("was_readonly_image_input");
    }
    let divs_not = document.querySelectorAll(".not_readonly_div");
    for (let div of divs_not){
        div.classList.remove("not_readonly_div");
        div.classList.add("was_not_readonly_div");
    }
    let divs  = document.querySelectorAll(".readonly_div");
    for (let div of divs){
        div.classList.remove("readonly_div");
        div.classList.add("was_readonly_div");
    }
}

function addReadonlys(){
    let inputs = document.querySelectorAll(".was_readonly_input");
    for (let input of inputs){
        input.setAttribute("readonly",true);
    }
    let disabled_inputs = document.querySelectorAll(".was_disabled_input");
    for (let input of disabled_inputs){
        input.setAttribute("disabled",true);
    }
    let header = document.querySelector(".was_readonly_header");
    if (header){
        header.classList.remove("was_readonly_header");
        header.classList.add("readonly_header");
    }
    let imagesContainers = document.querySelectorAll(".was_readonly_image_input");
    for (let container of imagesContainers){
        container.classList.remove("was_readonly_image_input");
        container.classList.add("readonly_image_input");
    }
    let divs_not = document.querySelectorAll(".was_not_readonly_div");
    for (let div of divs_not){
        div.classList.remove("was_not_readonly_div");
        div.classList.add("not_readonly_div");
    }
    let divs  = document.querySelectorAll(".was_readonly_div");
    for (let div of divs){
        div.classList.remove("was_readonly_div");
        div.classList.add("readonly_div");
    }
}

function validateFormWithNoStyles(form){
    var inputs = form.querySelectorAll(".needs-validation");
    for (let input of inputs){
        if (input.value == ""){
            return false;
        }
    }
    return true;
}

function removeClassFromAllElements(className){
    let elements = document.querySelectorAll("."+className);
    for (let element of elements){
        element.classList.remove(className);
    }
}

function removeClassesFromAllElements(classNames){
    for (let className of classNames){
        removeClassFromAllElements(className);
    }
}

async function callAPI(element,redirect){
    let url = element.dataset.href;
    const response = await fetch(url, {
        method: 'POST'
    });
    if (redirect){
        window.location.href = await response.json();
    }
    return response;
}

async function downloadCSV(element){
    let response = await callAPI(element,false);
    let filepath = await response.text();
    downloadFile(filepath);
}

function downloadFile(filepath) {
    const link = document.createElement("a");
    link.download = filepath.split('/').pop();
    link.style.display = "none";
    link.href = filepath

    // It needs to be added to the DOM so it can be clicked
    document.body.appendChild(link);
    link.click();

    // To make this work on Firefox we need to wait
    // a little while before removing it.
    setTimeout(() => {
        URL.revokeObjectURL(link.href);
        link.parentNode.removeChild(link);
    }, 0);
}

function activateAndDeactiveOther(ele,class_name){
    document.querySelectorAll(class_name).forEach(innerItem => {
        innerItem.classList.remove('active');
    });
    ele.classList.add('active');
    const carousel = ele.parentNode;
    const boundingRect = carousel.getBoundingClientRect();
    const itemRect = ele.getBoundingClientRect();
    const itemOffsetCenter = itemRect.left + itemRect.width / 2;
    const carouselCenter = boundingRect.left + boundingRect.width / 2;
    const offset = carouselCenter - itemOffsetCenter;

    // Apply the calculated offset to center the clicked item
    carousel.style.transform = `translateX(${offset}px)`;
}

function customGetJSON(url, callback) {
  
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (callback && typeof callback === 'function') {
          callback(data);
        }
      })
      .catch(error => console.error('There was a problem with the fetch operation:', error));
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
            row.insertCell();
        }
    }
}

function submitForm(ele){
    let form_id = ele.dataset.form_id;
    let form = document.getElementById(form_id);
    form.submit();
    form.reset();
}

function showLoading() {
    var loader = document.getElementById('loading-overlay');
    loader.style.display = 'flex';
}

function hideLoading() {
    var loader = document.getElementById('loading-overlay');
    loader.style.display = 'none';
}

function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const interval = 100;
        const endTime = Date.now() + timeout;

        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (Date.now() < endTime) {
                setTimeout(checkElement, interval);
            } else {
                reject(new Error('Element not found within the timeout period'));
            }
        };

        checkElement();
    });
}
