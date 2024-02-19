document.addEventListener('DOMContentLoaded', function () {
    let isRunning = false;
    let isPaused = false;
    let interval;
    let startTime;
    let endTime;
    let hourCounter = 0;
    let minuteCounter = 0;
    let secondCounter = 0;
    let reasons = [];
    let selectedExamType = document.getElementById('examType').value;
    let usePresetTime = false;
    let examDurations = {
        'TYT': { hours: 2, minutes: 15 },
        'AYT': { hours: 3, minutes: 30 },
        'YDS': { hours: 2, minutes: 30 },
        'DGS': { hours: 3, minutes: 45 },
        'KPSS': { hours: 2, minutes: 30 }
    };

    const counterElement = document.getElementById('timer');
    const hourInput = document.getElementById('hourInput');
    const minuteInput = document.getElementById('minuteInput');
    const secondInput = document.getElementById('secondInput');
    const reasonInput = document.getElementById('reasonInput');
    const saveReasonButton = document.getElementById('saveReason');
    const attentionMessage = document.getElementById('attentionMessage');
    const reasonsList = document.getElementById('reasons');
    const examTypeSelect = document.getElementById('examType');
    const usePresetTimeButton = document.getElementById('usePresetTime');

    let currentReason = ''; // Değişiklik: Şu anki nedeni saklamak için bir değişken ekledik.

    document.getElementById('start').addEventListener('click', startTimer);
    document.getElementById('pause').addEventListener('click', pauseTimer);
    document.getElementById('resume').addEventListener('click', resumeTimer);
    document.getElementById('saveReason').addEventListener('click', saveReason);
    document.getElementById('resetTimer').addEventListener('click', resetTimerWithoutClearingReasons);
    document.getElementById('clearReasons').addEventListener('click', clearReasons);
    document.getElementById('usePresetTime').addEventListener('click', togglePresetTime);
    examTypeSelect.addEventListener('change', updateExamDuration);

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            startTime = new Date();
            setExamDuration();
            interval = setInterval(updateTime, 1000);
            updateButtonStyles();
        }
    }

    function pauseTimer() {
        if (isRunning && !isPaused) {
            isPaused = true;
            endTime = new Date();
            clearInterval(interval);
            showReasonInput(true);
            showAttentionMessage(true);
            updateButtonStyles();
        }
    }

    function resumeTimer() {
        if (isRunning && isPaused) {
            isPaused = false;
            const elapsedTime = new Date() - endTime;
            startTime = new Date(startTime.getTime() + elapsedTime);
            interval = setInterval(updateTime, 1000);
            showReasonInput(false);
            showAttentionMessage(false);
            updateButtonStyles();
        }
    }

    function resetTimerWithoutClearingReasons() {
        clearInterval(interval);
        isRunning = false;
        isPaused = false;
        startTime = null;
        endTime = null;
        hourCounter = 0;
        minuteCounter = 0;
        secondCounter = 0;
        updateCounter();
        showReasonInput(false);
        showAttentionMessage(false);
        updateButtonStyles();
    }

    function clearReasons() {
        reasons = [];
        updateReasonsList();
    }

function updateTime() {
    if (hourCounter === 0 && minuteCounter === 0 && secondCounter === 0) {
        clearInterval(interval);
        isRunning = false;
        showReasonInput(true);
        showAttentionMessage(true);
        alert("Zaman doldu!");
    } else {
        if (secondCounter === 0) {
            if (minuteCounter === 0) {
                hourCounter = Math.max(0, hourCounter - 1);
                minuteCounter = 59;
            } else {
                minuteCounter = Math.max(0, minuteCounter - 1);
            }
            secondCounter = 59;
        } else {
            secondCounter--;
        }
        updateCounter();
    }
}

    function updateCounter() {
        const formattedHour = hourCounter.toString().padStart(2, '0');
        const formattedMinute = minuteCounter.toString().padStart(2, '0');
        const formattedSecond = secondCounter.toString().padStart(2, '0');
        counterElement.textContent = `${formattedHour}:${formattedMinute}:${formattedSecond}`;
    }

    function setExamDuration() {
        if (!usePresetTime) {
            hourCounter = parseInt(hourInput.value) || 0;
            minuteCounter = parseInt(minuteInput.value) || 0;
            secondCounter = parseInt(secondInput.value) || 0;
            updateCounter();
        } else {
            const selectedExamDuration = examDurations[selectedExamType];
            hourCounter = selectedExamDuration.hours;
            minuteCounter = selectedExamDuration.minutes;
            secondCounter = 0;
            updateCounter();
        }
    }

    function togglePresetTime() {
        usePresetTime = !usePresetTime;
        setExamDuration();
        updateButtonStyles();
    }

    function updateExamDuration() {
        selectedExamType = examTypeSelect.value;
        setExamDuration();
        updateButtonStyles();
    }

    function saveReason() {
        const reason = reasonInput.value.trim();
        if (reason !== '') {
            const elapsedTime = calculateElapsedTime();
            reasons.push({ reason, startTime, endTime, elapsedTime });
            reasonInput.value = '';
            updateReasonsList();
            showReasonInput(false);
            showAttentionMessage(false);
        } else {
            showAttentionMessage(true);
        }
    }

    function updateReasonsList() {
        reasonsList.innerHTML = '';
        reasons.forEach((item, index) => {
            const listItem = document.createElement('li');

            const reasonText = document.createElement('p');
            reasonText.textContent = `Neden: ${item.reason}`;
            listItem.appendChild(reasonText);

            const startTimeText = document.createElement('p');
            startTimeText.textContent = `Başlangıç: ${formatTime(item.startTime)}`;
            listItem.appendChild(startTimeText);

            const endTimeText = document.createElement('p');
            endTimeText.textContent = `Durdurma: ${formatTime(item.endTime)}`;
            listItem.appendChild(endTimeText);

            const elapsedTimeText = document.createElement('p');
            elapsedTimeText.textContent = `Geçen Süre: ${formatElapsedTime(item.elapsedTime)}`;
            listItem.appendChild(elapsedTimeText);

            reasonsList.appendChild(listItem);
        });
    }

    function showReasonInput(show) {
        reasonInput.style.display = show && isPaused ? 'block' : 'none';
        saveReasonButton.style.display = show && isPaused ? 'block' : 'none';
    
        // Durdur butonuna basana kadar neden kaydetme alanını gizle
        if (isPaused) {
            reasonInput.style.display = 'block';
            saveReasonButton.style.display = 'block';
        }
    }
    

    function showAttentionMessage(show) {
        attentionMessage.style.display = show ? 'block' : 'none';
    }

    function updateButtonStyles() {
        usePresetTimeButton.textContent = usePresetTime ? 'Kendi Süreni Kullan' : 'Sınav Süresini Kullan';
        usePresetTimeButton.style.backgroundColor = usePresetTime ? '#92000A' : '#f34723';
        usePresetTimeButton.style.color = '#fff';

        const activeButton = document.querySelector('.active');
        if (isRunning && !isPaused) {
            activeButton.classList.remove('active');
            document.getElementById('pause').classList.add('active');
        } else if (isPaused) {
            activeButton.classList.remove('active');
            document.getElementById('resume').classList.add('active');
        } else {
            activeButton.classList.remove('active');
            document.getElementById('start').classList.add('active');
        }
    }

    function formatTime(time) {
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        const seconds = time.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function formatElapsedTime(elapsedTime) {
        const seconds = Math.floor(elapsedTime / 1000) % 60;
        const minutes = Math.floor(elapsedTime / (1000 * 60)) % 60;
        const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        return `${hours} saat, ${minutes} dakika, ${seconds} saniye`;
    }

    function calculateElapsedTime() {
        if (startTime && endTime) {
            return endTime - startTime;
        }
        return 0;
    }

    const saveNoteButton = document.getElementById('saveNote');
    const noteInput = document.getElementById('noteInput');
    const notesList = document.getElementById('notes');

    saveNoteButton.addEventListener('click', saveNote);

    function saveNote() {
        const noteText = noteInput.value.trim();
        if (noteText !== '') {
            const noteItem = document.createElement('p');
            noteItem.textContent = noteText;
            notesList.appendChild(noteItem);
            noteInput.value = '';
        }
    }

    document.getElementById('usePresetTime').addEventListener('click', toggleExamTypeVisibility);

    function toggleExamTypeVisibility() {
        const examTypeContainer = document.querySelector('.exam-type-container');
        examTypeContainer.style.display = usePresetTime ? 'block' : 'none';
    }
    toggleExamTypeVisibility();

    const toggleDarkModeButton = document.getElementById("toggleDarkMode");
    const body = document.body;
    
    // Sayfa yüklendiğinde localStorage'dan karanlık mod durumunu kontrol et
    if (localStorage.getItem("darkModeEnabled") === "true") {
        body.classList.add("dark-mode");
        toggleDarkModeButton.innerHTML = '<i class="fas fa-moon"></i>'; // Ay ikonu
    } else {
        toggleDarkModeButton.innerHTML = '<i class="fas fa-sun"></i>'; // Güneş ikonu
    }
    
    // Sayfa kapatıldığında kullanıcının tercihini hatırla
    window.addEventListener("beforeunload", function () {
        const isDarkModeEnabled = body.classList.contains("dark-mode");
        localStorage.setItem("darkModeEnabled", isDarkModeEnabled);
    });
    
    // Toggle butonuna tıklandığında karanlık modu aç/kapat
    toggleDarkModeButton.addEventListener("click", function () {
        body.classList.toggle("dark-mode");
    
        // Ikonları güncelle
        const isDarkModeEnabled = body.classList.contains("dark-mode");
        toggleDarkModeButton.innerHTML = isDarkModeEnabled ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>'; // Güneş veya ay ikonunu güncelle
    });
    






            /*
            // Zamanı güncelleme fonksiyonu
            function updateTime() {
                var timeElements = document.querySelectorAll('.time');
                timeElements.forEach(function (element) {
                    var postTime = new Date(element.textContent);
                    var currentTime = new Date();
                    var elapsedMinutes = Math.floor((currentTime - postTime) / (1000 * 60));
        
                    if (elapsedMinutes < 60) {
                        element.textContent = elapsedMinutes + ' dakika önce';
                    } else {
                        var elapsedHours = Math.floor(elapsedMinutes / 60);
                        element.textContent = elapsedHours + ' saat önce';
                    }
                });
            }
        
            // İlk kez çağrıldığında çalıştır
            updateTime();
        
            // Her 1 dakikada bir güncelle
            setInterval(updateTime, 60000);
        
            // Paylaşma iconu ekleyen ve paylaşım işlemini yapan bir fonksiyon tanımla
            function saveNote() {
                // Notun içeriğini ve tarihini al
                var noteContent = document.getElementById('noteInput').value.trim();
                var noteDate = new Date().toISOString();
    
                // Boş bir not değilse devam et
                if (noteContent !== "") {
                    // Notu ekleyerek liste güncelle
                    var notesList = document.getElementById('notes');
                    var noteLi = document.createElement('li');
                    noteLi.innerHTML = '<p>' + noteContent + '</p>';
                    notesList.appendChild(noteLi);
    
                    // Paylaşma iconunu ekleyerek liste güncelle
                    var shareIcon = document.createElement('i');
                    shareIcon.setAttribute('class', 'fas fa-share-alt share-icon');
                    shareIcon.setAttribute('title', 'Paylaş');
                    // Paylaşma iconunun id'si olarak notun tarihini kullan
                    shareIcon.setAttribute('id', noteDate);
                    noteLi.appendChild(shareIcon);
    
                    // Paylaşma iconuna bir olay dinleyicisi ekleyerek liste güncelle
                    shareIcon.addEventListener('click', function () {
                        // Paylaşılan notun içeriğini, tarihini ve paylaşanın adını veya takma adını al
                        var sharedNoteContent = noteContent;
                        var sharedNoteDate = noteDate;
                        // Bu örnekte, kullanıcı adı "user123" olarak varsayılmıştır
                        // Bu bilgiyi HTML dosyanızda bir input öğesiyle veya JavaScript kodunuzda bir prompt ile alabilirsiniz
                        var username = "user123";
    
                        // Paylaşılan notu liste güncelle
                        var postsList = document.getElementById('posts');
                        var sharedNoteLi = document.createElement('li');
                        sharedNoteLi.innerHTML = '<p>' + sharedNoteContent + '</p>';
                        postsList.appendChild(sharedNoteLi);
    
                        // Paylaşanın adını veya takma adını ekleyerek liste güncelle
                        var usernameSpan = document.createElement('span');
                        usernameSpan.className = "username";
                        usernameSpan.textContent = username;
                        sharedNoteLi.appendChild(usernameSpan);
    
                        // Paylaşımın tarihini ve saatini ekleyerek liste güncelle
                        var dateSpan = document.createElement('span');
                        dateSpan.className = "time";
                        dateSpan.textContent = sharedNoteDate;
                        sharedNoteLi.appendChild(dateSpan);
                    });
    
                    // Not input'unu temizle
                    document.getElementById('noteInput').value = "";
                }
            }
    
            // saveNote fonksiyonunu, saveNote butonuna bir olay dinleyicisi olarak atayın
            document.getElementById('saveNote').addEventListener('click', saveNote);

            */
    
});
