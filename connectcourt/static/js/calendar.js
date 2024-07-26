document.addEventListener('DOMContentLoaded', function() {
    const weekDaysElement = document.querySelector('.week-days');
    const weekDaysMobileElement = document.querySelector('.week-days-mobile');
    const timeLabelsElement = document.querySelector('.time-labels');
    const calendarGridElement = document.querySelector('.calendar-grid');
    const datePickerButton = document.getElementById('date-picker-button');
    const datePickerInput = document.getElementById('date-picker-input');
    const todayButton = document.getElementById('today-button');
    const prevWeekButton = document.getElementById('prev-week');
    const nextWeekButton = document.getElementById('next-week');
    const datePicker = document.querySelector('.date-picker');
    const dailyCalendar = document.querySelector('.daily-calendar');

    let currentDate = new Date();
    let today = new Date();

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
        const formattedDate = date.toLocaleDateString('en-US', options);
    
        const dateParts = formattedDate.split(' ');
        const weekday = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
    
        return `<span class="weekday">${weekday.replace(',', '')}</span> <span class="month">${month}</span> <span class="day">${day}</span>`;
    }

    function hideAllSlots() {
        document.querySelectorAll('.daily-slot').forEach(slot => slot.classList.remove('active'));
        document.querySelectorAll('.day-header').forEach(header => header.classList.remove('active'));
    }

    function showSlot(index) {
        document.querySelectorAll('.daily-slot')[index].classList.add('active');
    }

    function longFormatDate(date){
        const optionsWeekday = { weekday: 'long' };
        const optionsDay = { day: 'numeric' };
        const optionsMonth = { month: 'long' };
        const optionsYear = { year: 'numeric' };

        const formatterWeekday = new Intl.DateTimeFormat('en-GB', optionsWeekday);
        const formatterDay = new Intl.DateTimeFormat('en-GB', optionsDay);
        const formatterMonth = new Intl.DateTimeFormat('en-GB', optionsMonth);
        const formatterYear = new Intl.DateTimeFormat('en-GB', optionsYear);

        const weekday = formatterWeekday.format(date);
        const day = formatterDay.format(date);
        const month = formatterMonth.format(date);
        const year = formatterYear.format(date);

        const formattedDate = `${weekday}, ${day} of ${month} of ${year}`;
        return formattedDate
    }

    function renderCalendar() {
        weekDaysElement.innerHTML = '';
        timeLabelsElement.innerHTML = '';
        calendarGridElement.innerHTML = '';
        weekDaysMobileElement.innerHTML = '';
        dailyCalendar.innerHTML = '';

        const weekDays = getWeekDays(new Date(currentDate));

        weekDays.forEach((day, index) => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day-header');
            dayElement.innerHTML = formatDate(day);
            weekDaysElement.appendChild(dayElement);
            
            const clonedDayElement = dayElement.cloneNode(true);

            clonedDayElement.addEventListener('click', function() {
                console.log('HERE')
                hideAllSlots();
                showSlot(index);
                clonedDayElement.classList.add('active');
            });

            const dailySlot = document.createElement('div');
            const dailyTitle = document.createElement('div');
            dailySlot.classList.add('daily-slot');
            dailyTitle.classList.add('daily-day-title');
            dailyTitle.textContent = longFormatDate(day);
            if (index == 0){
                clonedDayElement.classList.add('active');
                dailySlot.classList.add('active');
            }
            if (day.getTime() < today.getTime()) {
                clonedDayElement.classList.add('past-day');
            }
            if (day.getTime() == today.getTime()){
                clonedDayElement.classList.add('active');
                dailySlot.classList.add('active');
                hideAllSlots();
            }
            weekDaysMobileElement.appendChild(clonedDayElement);
            dailySlot.appendChild(dailyTitle);
            dailyCalendar.appendChild(dailySlot);
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
        
        let events = [
            {title:"Meeting with Bob", weekDay:1, begging:"08:00", end:"09:30",color:"#dc7171"},
            {title:"Lunch Break", weekDay:1, begging:"08:30", end:"10:00",color:"#b9b9ff"},
            {title:"Meeting with Bob", weekDay:2, begging:"10:00", end:"12:00",color:"#5db25d"},
            {title:"Lunch Break", weekDay:4, begging:"12:00", end:"13:00",color:"#b9b9ff"},
            {title:"Lunch Break", weekDay:5, begging:"12:30", end:"14:45",color:"#b9b9ff"},
        ]
        
        addEvents(events)

        const existingDateInputText = document.querySelector('.date-input-text');
        if (existingDateInputText) {
            existingDateInputText.remove();
        }
        const dateInputText = document.createElement('div');
        dateInputText.classList.add('date-input-text');
        dateInputText.textContent = `${currentDate.toDateString()}`;
        datePickerButton.appendChild(dateInputText);

        updateCurrentTimeIndicator();
        setInterval(updateCurrentTimeIndicator, 60000);
    }

    function setWeek(date) {
        currentDate = new Date(date);
        renderCalendar();
    }

    function addEvents(events) {
        for (obj of events){
            addEventGrid(obj.title, obj.weekDay, obj.begging, obj.end, obj.color);
            addEventDaily(obj.title, obj.weekDay, obj.begging, obj.end, obj.color);
        }
    }

    function addEventGrid(title, day, startTime, endTime, color) {
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

    function addEventDaily(title, day, startTime, endTime, color) {    
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
        eventBlockElement.style.borderLeftColor = color;
        eventBlockElement.appendChild(eventBlockTimeElement);
        eventBlockElement.appendChild(eventBlockTitleElement);
    
        eventElement.appendChild(eventBlockElement);
    
        const dailyElement = dailyCalendar.children[day];
        dailyElement.appendChild(eventElement);
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
