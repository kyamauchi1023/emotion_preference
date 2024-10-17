const numTrials = 2;
let currentTrial = 0;
let rankings = [];
let sampleIds = [0, 1, 2, 3, 4];
let audioPlayed = [false, false, false, false, false]; // Track if each audio has been played
let isPlaying = false;  // Track if any audio is currently playing

// Generate random values for speakerId, textId, and emotionId
let speakerId = getRandomInt(1, 10);   // Random speaker ID between 1 and 10
let textId = getRandomInt(20, 50);     // Random text ID between 20 and 50
let emotionId = getRandomInt(0, 4);    // Random emotion ID between 0 and 4

// Utility function to generate a random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Emotion ID to text mapping
const emotionMap = {
    0: 'Neutral',
    1: 'Angry',
    2: 'Happy',
    3: 'Sad',
    4: 'Surprised'
};

// Function to update the trial count display
function updateTrialCount() {
    document.getElementById('trial-count').textContent = `Question ${currentTrial + 1}/${numTrials}`;
}

// Function to load audio files and set emotion label
function loadAudio() {
    sampleIds = shuffle(sampleIds); // Shuffle the sample order randomly
    document.getElementById('emotion-label').textContent = `Emotion: ${emotionMap[emotionId]}`; // Display emotion
    updateTrialCount();  // Update the trial count

    // Reset card movements and ranking button
    disableRanking();

    // Reset the ranking slots
    document.querySelectorAll('.drop-slot').forEach(slot => {
        slot.innerHTML = '';  // Clear the slot content
    });

    for (let i = 0; i < sampleIds.length; i++) {
        let audio = document.getElementById(`audio${i}`);
        audio.src = `wav/${speakerId}_${textId}_${emotionId}_${sampleIds[i]}.wav`;
        audioPlayed[i] = false; // Reset play status
        audio.onplay = () => handleAudioPlay(i);
        audio.onpause = () => handleAudioPause();
        audio.onended = () => handleAudioPause(); // Ensure state resets when audio ends
    }
}

// Handle audio play events, preventing other audios from playing simultaneously
function handleAudioPlay(index) {
    if (isPlaying) {
        document.getElementById(`audio${index}`).pause();  // Prevent playing if another audio is playing
        return;
    }
    isPlaying = true;
    audioPlayed[index] = true;
    if (audioPlayed.every(Boolean)) {
        enableRanking();  // Enable ranking once all audios have been played
    }
}

// Handle audio pause/stop events
function handleAudioPause() {
    isPlaying = false;  // Allow other audios to be played
}

// Enable ranking after all audios have been played
function enableRanking() {
    document.querySelectorAll('.rank-item').forEach(item => {
        item.setAttribute('draggable', 'true');  // Enable dragging
    });
}

// Disable ranking after submission
function disableRanking() {
    document.querySelectorAll('.rank-item').forEach(item => {
        item.setAttribute('draggable', 'false');  // Disable dragging
    });
    document.getElementById('submit-button').disabled = true;
}

// Function to shuffle an array
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

document.querySelectorAll('.rank-item').forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
});

document.querySelectorAll('.drop-slot').forEach(slot => {
    slot.addEventListener('dragover', handleDragOver);
    slot.addEventListener('drop', handleDrop);
});

// Function to handle drag and drop
function handleDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.innerText);
}

// Function to check if all slots are filled
function checkSlots() {
    const slots = document.querySelectorAll('.drop-slot');
    const submitButton = document.getElementById('submit-button');

    // Check if all slots have a card
    const allFilled = Array.from(slots).every(slot => slot.innerText !== '');
    
    // Enable or disable the submit button based on slot state
    submitButton.disabled = !allFilled;
}

// Function to handle drop event
function handleDrop(event) {
    event.preventDefault();
    const cardText = event.dataTransfer.getData("text/plain");

    // Check if the card is already in a slot
    const slots = document.querySelectorAll('.drop-slot');
    for (let slot of slots) {
        if (slot.innerText === cardText) {
            return; // Don't allow drop if the card is already in a slot
        }
    }

    // If card is not in a slot, allow drop
    event.target.innerText = cardText;
    event.target.style.backgroundColor = '#d9ffc9'; // Change color to light green
    const cards = document.querySelectorAll('.rank-item');
    cards.forEach(card => {
        if (card.innerText === cardText) {
            card.style.backgroundColor = '#d9ffc9'; // Change the card color to light green as well
        }
    });

    checkSlots(); // Check slots after dropping a card
}

function handleDragOver(event) {
    event.preventDefault();
}

// Handle ranking submission
document.getElementById('submit-button').addEventListener('click', () => {
    const ranking = Array.from(document.querySelectorAll('.drop-slot')).map(slot => slot.textContent);
    rankings.push(ranking);
    currentTrial++;

    disableRanking();  // Disable further card movements after submission

    if (currentTrial < numTrials) {
        // Generate new random speakerId, textId, and emotionId for the next trial
        speakerId = getRandomInt(1, 10);
        textId = getRandomInt(20, 50);
        emotionId = getRandomInt(0, 4);
        loadAudio();  // Load new audio for the next trial
        handleResetRanking();
    } else {
        saveResults();  // Save results at the end of all trials
    }
});

// Function to handle reset ranking
function handleResetRanking() {
    // Reset the slots
    const slots = document.querySelectorAll('.drop-slot');
    slots.forEach(slot => {
        slot.innerText = '';
        slot.style.backgroundColor = '#f8f8f8'; // Reset to default color
    });

    // Reset the cards
    const cards = document.querySelectorAll('.rank-item');
    cards.forEach(card => {
        card.style.backgroundColor = '#b8d6f9'; // Reset card color to light blue
    });

    checkSlots(); // Check slots after resetting
}

// Save the results to a CSV file
function saveResults() {
    // let csvContent = "data:text/csv;charset=utf-8,Trial,RankA,RankB,RankC,RankD,RankE\n";
    let csvContent = "Trial,RankA,RankB,RankC,RankD,RankE\n";
    rankings.forEach((rank, index) => {
        csvContent += `${index + 1},${rank.join(",")}\n`;
    });

    var d = new Date();
    var year  = d.getFullYear();
    var month = (d.getMonth() + 1).toString().padStart(2, '0'); // ゼロ埋めで2桁にする
    var day   = d.getDate().toString().padStart(2, '0');
    var hour  = d.getHours().toString().padStart(2, '0');
    var min   = d.getMinutes().toString().padStart(2, '0');
    var sec   = d.getSeconds().toString().padStart(2, '0');
    var fname = year + month + day + hour + min + sec + ".csv"; // ファイル名：年月日時分秒.csv

    var form = document.getElementById('csvForm');

    form.action = "save_result.php"; // ジャンプ先 (結果保存用の php)
    form.method = 'post'; // POST で送信
    form.elements["fname"].value = fname;
    form.elements["to"].value = "log/"; // 結果を送る先を指定 !!!超重要!!!
    form.elements["csvData"].value = csvContent

    form.submit();
}

// Load the first trial
loadAudio();

// Add an event listener for the reset button
document.getElementById('reset-button').addEventListener('click', handleResetRanking);

// Disable the submit button initially
document.getElementById('submit-button').disabled = true;
