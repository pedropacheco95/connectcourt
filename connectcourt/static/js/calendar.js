document.addEventListener('DOMContentLoaded', function() {
    const weekDaysElement = document.querySelector('.week-days');
    const weekDaysMobileElement = document.querySelector('.week-days-mobile');
    const eventInfoElement = document.querySelector('.event-info-header');
    const timeLabelsElement = document.querySelector('.time-labels');
    const calendarGridElement = document.querySelector('.calendar-grid');
    const datePickerButton = document.getElementById('date-picker-button');
    const datePickerInput = document.getElementById('date-picker-input');
    const todayButton = document.getElementById('today-button');
    const prevWeekButton = document.getElementById('prev-week');
    const nextWeekButton = document.getElementById('next-week');
    const datePicker = document.querySelector('.date-picker');
    const dailyCalendar = document.querySelector('.daily-calendar');
    // const checkbox = document.getElementById('checkbox_singleClass');
    const singleLessonGroups = document.querySelectorAll('.form-group.single_lesson');
    const scheduledLessonGroups = document.querySelectorAll('.form-group.scheduled_lessons');
    // const submitFormButton = document.getElementById('lesson_form_submit')
    const eventInfoHeader = document.querySelector('.event-info-header');

    function toggleLessonGroups() {
        if (checkbox.checked) {
            singleLessonGroups.forEach(group => group.style.display = 'block');
            scheduledLessonGroups.forEach(group => group.style.display = 'none');
        } else {
            singleLessonGroups.forEach(group => group.style.display = 'none');
            scheduledLessonGroups.forEach(group => group.style.display = 'block');
        }
    }

    //toggleLessonGroups();

    //checkbox.addEventListener('change', toggleLessonGroups);

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

    async function fetchLessons(startDate, endDate) {
        try {
            const response = await fetch(`/api/lessons?start_date=${startDate}&end_date=${endDate}`);
            const lessons = await response.json();
            const events = lessons.map(lesson => {
                let lessonDate = new Date(lesson.datetime);
                let startHour = lessonDate.getHours();
                let startMinute = lessonDate.getMinutes();
                let durationParts = lesson.duration.split(':');
                let endHour = startHour + parseInt(durationParts[0]);
                let endMinute = startMinute + parseInt(durationParts[1]);

                if (endMinute >= 60) {
                    endHour += Math.floor(endMinute / 60);
                    endMinute = endMinute % 60;
                }

                return {
                    id: lesson.id,
                    title: lesson.title,
                    weekDay: lessonDate.getDay(),
                    begging: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
                    end: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
                    color: getColorForLevel(lesson.level),
                    edit_modal_url: lesson.edit_modal_url
                };
            });
            addEvents(events);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        }
    }

    async function fetchPlayersInLesson(lesson_id) {
        try {
            const response = await fetch(`/api/players_in_lesson/${lesson_id}`);
            const players = await response.json();
            return players
        } catch (error) {
            console.error('Error fetching players:', error);
        }
    }

    function getColorForLevel(level) {
        switch (level) {
            case 'Very Low':
                return '#dc7171';
            case 'Low':
                return '#b9b9ff';
            case 'Medium':
                return '#5db25d';
            case 'High':
                return '#ffb347';
            case 'Very High':
                return '#ff6961';
            default:
                return '#b9b9ff';
        }
    }

    function renderCalendar() {
        weekDaysElement.innerHTML = '';
        timeLabelsElement.innerHTML = '';
        calendarGridElement.innerHTML = '';
        weekDaysMobileElement.innerHTML = '';
        dailyCalendar.innerHTML = '';

        const weekDays = getWeekDays(new Date(currentDate));
        const startDate = weekDays[0].toISOString().split('T')[0];
        const endDate = weekDays[6].toISOString().split('T')[0];

        weekDays.forEach((day, index) => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day-header');
            dayElement.innerHTML = formatDate(day);
            weekDaysElement.appendChild(dayElement);
            
            const clonedDayElement = dayElement.cloneNode(true);

            clonedDayElement.addEventListener('click', function() {
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
        for (let hour = 7; hour <= 22; hour++) {
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
        
        fetchLessons(startDate, endDate);

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
        hideLoading()
    }

    function setWeek(date) {
        currentDate = new Date(date);
        renderCalendar();
    }

    function addEvents(events) {
        for (const obj of events) {
            addEventGrid(obj.id, obj.title, obj.weekDay, obj.begging, obj.end, obj.color, obj.edit_modal_url);
            addEventDaily(obj.id, obj.title, obj.weekDay, obj.begging, obj.end, obj.color, obj.edit_modal_url);
        }
    }

    function addEventGrid(id, title, day, startTime, endTime, color, url) {
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

        const timeSlotIndex = (startHour - 7) * 7 + day + 1;

        const topPosition = (startMinute / 60) * 100;
        eventElement.style.top = `${topPosition - 2}px`;
        eventElement.style.height = `${(duration / 60) * 100}px`;
        
        eventElement.appendChild(eventBlockElement)
        calendarGridElement.children[timeSlotIndex].appendChild(eventElement);

        var name = title.replace(/\s+/g, '_');
        eventElement.setAttribute('data-field_name', name);
        eventElement.setAttribute('data-url', url);
        eventElement.setAttribute('data-title', 'Editar Aula');
        eventElement.setAttribute('data-modal_id', `modal_${name}`);

        eventElement.addEventListener('click', async function() {
            await loadModal(eventElement);
            const iframe = await waitForElement('#hidden_iframe_Aulas');
            const confirmChangeButton = await waitForElement(`#confirm_create_${name}`);
            const cancelChangeButton = await waitForElement(`#cancel_create_${name}`);

            confirmChangeButton.addEventListener('click', function() {
                showLoading();
            });

            cancelChangeButton.addEventListener('click', function() {
                renderCalendar();
            });
            iframe.addEventListener('load', function() {
                renderCalendar();
            });
        });
    }

    function addEventDaily(id, title, day, startTime, endTime, color, url) {    
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

        var name = title.replace(/\s+/g, '_');
        eventElement.setAttribute('data-field_name', name);
        eventElement.setAttribute('data-url', url);
        eventElement.setAttribute('data-title', 'Editar Aula');
        eventElement.setAttribute('data-modal_id', `modal_${name}`);

        eventElement.addEventListener('click', async function() {
            await loadModal(eventElement);
            const iframe = await waitForElement('#hidden_iframe_Aulas');
            const confirmChangeButton = await waitForElement(`#confirm_create_${name}`);
            const cancelChangeButton = await waitForElement(`#cancel_create_${name}`);

            confirmChangeButton.addEventListener('click', function() {
                showLoading();
            });

            cancelChangeButton.addEventListener('click', function() {
                console.log('Here')
                renderCalendar();
            });
            iframe.addEventListener('load', function() {
                renderCalendar();
            });
        });
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

    function submitLessonForm(ele){
        let form_id = ele.dataset.form_id;
        let form = document.getElementById(form_id);
    
        form.submit();
        form.reset();

        let player_box = document.getElementById('selected_options_players')
        player_box.innerHTML = '';
        
        var iframe = document.getElementById('hidden_iframe');
        iframe.onload = function() {
            hideLoading();
            renderCalendar();
        };
    }

    async function getLessonInfo(id){
        
    }

    async function showEventInfo(lesson_id){
        eventInfoElement.innerHTML = '';
        let players = await fetchPlayersInLesson(lesson_id);
        let playersDiv = document.createElement('div');
        playersDiv.className = 'players-div';
        for (let player of players){

            let playerDiv = document.createElement('div');
            playerDiv.className = 'player-div';

            let playerImg = document.createElement('img');
            playerImg.src = `static/images/${player.image_url.trim()}`;
            playerImg.alt = player.name;
            playerImg.className = 'player-img';

            let playerName = document.createElement('div');
            playerName.textContent = player.name;
            playerName.className = 'player-name';

            let playerDelete = document.createElement('div');
            playerDelete.innerHTML = '&times;';
            playerDelete.className = 'player-delete';

            let player_id = player.id
            playerDelete.addEventListener('click', async function() {
                const response = await fetch('/api/remove_lesson_player_relationship', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id1: lesson_id,
                        id2: player_id
                    })
                })
                if (response.ok) {
                    const result = await response.json();
                    showEventInfo(lesson_id);
                } else {
                    console.error('Failed to remove lesson player relationship');
                }
            });

            playerDiv.appendChild(playerImg);
            playerDiv.appendChild(playerName);
            playerDiv.appendChild(playerDelete);

            playersDiv.appendChild(playerDiv)

        } 
        eventInfoElement.appendChild(playersDiv);
        eventInfoElement.style.display = 'block';
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

    /* submitFormButton.addEventListener('click', function(event){
        const element = event.currentTarget;
        submitLessonForm(element);
        closeModal(undefined, element)
    }) */

    document.addEventListener('click', (e) => {
        if (!eventInfoHeader.contains(e.target)) {
            eventInfoHeader.style.display = 'none';
        }
    });

    renderCalendar();
});
