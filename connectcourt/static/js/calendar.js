document.addEventListener('DOMContentLoaded', function() {
    const weekDaysElement = document.querySelector('.week-days');
    const timeLabelsElement = document.querySelector('.time-labels');
    const calendarGridElement = document.querySelector('.calendar-grid');
    const datePickerButton = document.getElementById('date-picker-button');
    const datePickerInput = document.getElementById('date-picker-input');
    const todayButton = document.getElementById('today-button');
    const prevWeekButton = document.getElementById('prev-week');
    const nextWeekButton = document.getElementById('next-week');
    const datePicker = document.querySelector('.date-picker');

    let currentDate = new Date();

    function getWeekDays(date) {
        const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            weekDays.push(new Date(startOfWeek));
            startOfWeek.setDate(startOfWeek.getDate() + 1);
        }
        return weekDays;
    }

    function formatDate(date) {
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-US', options);
    }

    function renderCalendar() {
        weekDaysElement.innerHTML = '';
        timeLabelsElement.innerHTML = '';
        calendarGridElement.innerHTML = '';

        const weekDays = getWeekDays(new Date(currentDate));

        weekDays.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day-header');
            dayElement.textContent = formatDate(day);
            weekDaysElement.appendChild(dayElement);
        });

        // Append weekDaysElement to the calendarGridElement
        calendarGridElement.appendChild(weekDaysElement);

        const emptyTimeLabel = document.createElement('div');
        emptyTimeLabel.classList.add('time-label');
        timeLabelsElement.appendChild(emptyTimeLabel);
        for (let hour = 7; hour <= 19; hour++) {
            const timeLabel = document.createElement('div');
            timeLabel.classList.add('time-label');
            timeLabel.textContent = `${hour}:00`;
            timeLabelsElement.appendChild(timeLabel);

            for (let col = 0; col < 7; col++) {
                const timeSlotElement = document.createElement('div');
                timeSlotElement.classList.add('time-slot');
                if (hour === new Date().getHours()) {
                    timeSlotElement.classList.add('current-hour');
                }
                calendarGridElement.appendChild(timeSlotElement);
            }
        }

        // Add sample events for demonstration purposes
        addEvent("Meeting with Bob", 1, "08:00", "09:30", "#dc7171");
        addEvent("Lunch Break", 1, "08:30", "10:00", "#b9b9ff");
        addEvent("Design Review", 2, "10:00", "12:00", "#5db25d");
        addEvent("Lunch Break", 4, "12:00", "13:00", "#b9b9ff");
        addEvent("Lunch Break", 5, "12:30", "14:45", "#b9b9ff");

        datePickerButton.textContent = `${currentDate.toDateString()}`;

        updateCurrentTimeIndicator();
        setInterval(updateCurrentTimeIndicator, 60000);
    }

    function setWeek(date) {
        currentDate = new Date(date);
        renderCalendar();
    }

    function addEvent(title, day, startTime, endTime, color) {
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        const eventElement = document.createElement('div');
        eventElement.classList.add('event');
        
        const eventBlockElement = document.createElement('div');
        eventBlockElement.classList.add('event_block');

        const eventBlockTitleElement = document.createElement('div');
        eventBlockTitleElement.classList.add('event_block_title');
        const eventBlockTimeElement = document.createElement('div');
        eventBlockTimeElement.classList.add('event_block_time');

        eventBlockTitleElement.textContent = title;
        eventBlockTimeElement.textContent = `${startTime} - ${endTime}`;
        eventBlockElement.style.backgroundColor = color;
        eventBlockElement.appendChild(eventBlockTitleElement);
        eventBlockElement.appendChild(eventBlockTimeElement);

        const startSlot = (startHour - 7) * 60 + startMinute;
        const endSlot = (endHour - 7) * 60 + endMinute;
        const duration = endSlot - startSlot;

        const timeSlotIndex = (startHour - 7) * 7 + day;

        const topPosition = (startMinute / 60) * 100;
        eventElement.style.top = `${topPosition - 2}px`;
        eventElement.style.height = `${(duration / 60) * 100}px`;
        
        eventElement.appendChild(eventBlockElement)
        calendarGridElement.children[timeSlotIndex].appendChild(eventElement);
    }

    function updateCurrentTimeIndicator() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const totalMinutes = (currentHour - 7) * 60 + currentMinutes;

        const timeIndicator = document.querySelector('.time-indicator');
        if (timeIndicator) {
            timeIndicator.remove();
        }

        const timeIndicatorElement = document.createElement('div');
        timeIndicatorElement.classList.add('time-indicator');
        timeIndicatorElement.style.top = `${(totalMinutes / 60) * 100 + 50}px`;

        calendarGridElement.appendChild(timeIndicatorElement);
    }

    datePickerButton.addEventListener('click', function() {
        datePicker.classList.toggle('active');
    });

    datePickerInput.addEventListener('change', function(event) {
        const selectedDate = new Date(event.target.value);
        setWeek(selectedDate);
        datePicker.classList.remove('active');
    });

    todayButton.addEventListener('click', function() {
        currentDate = new Date();
        setWeek(currentDate);
    });

    prevWeekButton.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() - 7);
        setWeek(currentDate);
    });

    nextWeekButton.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() + 7);
        setWeek(currentDate);
    });

    renderCalendar();
});
