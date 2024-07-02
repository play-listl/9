document.addEventListener('DOMContentLoaded', function() {
    const answersList = document.getElementById('answers');
    const submitButton = document.getElementById('submit-btn');
    const shareButton = document.getElementById('share-btn');
    const scoreText = document.getElementById('score');
    const instructions = document.getElementById('instructions');

    const points = {
        'Cristiano Ronaldo': [20, 12, 8, 6, 4, 3, 2, 0],
        'Lionel Messi': [16, 16, 11, 7, 5, 4, 2, 1],
        'Selena Gomez': [12, 12, 14, 9, 7, 5, 3, 2],
        'Kylie Jenner': [10, 10, 11, 12, 8, 6, 4, 4],
        'Dwayne Johnson': [8, 8, 8, 9, 11, 8, 5, 5],
        'Ariana Grande': [6, 6, 7, 7, 8, 10, 7, 5],
        'Kim Kardashian': [5, 5, 5, 6, 7, 9, 9, 7],
        'Beyoncé': [4, 4, 4, 4, 5, 6, 7, 8]
    };

    const correctOrder = [
        { city: 'Cristiano Ronaldo', year: '629 million' },
        { city: 'Lionel Messi', year: '502 million' },
        { city: 'Selena Gomez', year: '428 million' },
        { city: 'Kylie Jenner', year: '399 million' },
        { city: 'Dwayne Johnson', year: '397 million' },
        { city: 'Ariana Grande', year: '379 million' },
        { city: 'Kim Kardashian', year: '363 million' },
        { city: 'Beyoncé', year: '319 million' }
    ];

    let gamesPlayed = 0;
    let highScore = 0;
    let totalScore = 0;
    let userAnswers = [];
    let scores = [];

    function displayAnswers() {
        const shuffledOrder = shuffle([...correctOrder]);
        answersList.innerHTML = '';
        shuffledOrder.forEach(answer => {
            const li = document.createElement('li');
            li.textContent = answer.city;
            li.draggable = true;
            answersList.appendChild(li);
        });
        addDragAndDropHandlers();
        addTouchHandlers();
    }

    function addDragAndDropHandlers() {
        const listItems = answersList.querySelectorAll('li');
        listItems.forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);
        });
    }

    function addTouchHandlers() {
        const listItems = answersList.querySelectorAll('li');
        listItems.forEach(item => {
            item.addEventListener('touchstart', handleTouchStart);
            item.addEventListener('touchmove', handleTouchMove);
            item.addEventListener('touchend', handleTouchEnd);
        });
    }

    let draggedItem = null;
    let touchStartY = 0;

    function handleDragStart(e) {
        draggedItem = this;
        setTimeout(() => this.classList.add('dragging'), 0);
    }

    function handleDragOver(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(answersList, e.clientY);
        if (afterElement == null) {
            answersList.appendChild(draggedItem);
        } else {
            answersList.insertBefore(draggedItem, afterElement);
        }
    }

    function handleDrop() {
        this.classList.remove('dragging');
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedItem = null;
    }

    function handleTouchStart(e) {
        draggedItem = this;
        touchStartY = e.touches[0].clientY;
        setTimeout(() => this.classList.add('dragging'), 0);
    }

    function handleTouchMove(e) {
        e.preventDefault();
        const touchLocation = e.touches[0].clientY;
        const afterElement = getDragAfterElement(answersList, touchLocation);
        if (afterElement == null) {
            answersList.appendChild(draggedItem);
        } else {
            answersList.insertBefore(draggedItem, afterElement);
        }
    }

    function handleTouchEnd() {
        this.classList.remove('dragging');
        draggedItem = null;
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
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

    submitButton.addEventListener('click', function() {
        userAnswers = Array.from(answersList.querySelectorAll('li')).map(li => li.textContent.trim());
        const result = calculateScore(userAnswers);
        gamesPlayed++;
        totalScore += result.score;
        highScore = Math.max(highScore, result.score);
        scores = result.scores;
        scoreText.textContent = `Total Score ${totalScore}/100`;

        // Show correct answers and user scores
        showCorrectAnswers(userAnswers, scores);

        submitButton.disabled = true;
    });

    shareButton.addEventListener('click', function() {
        const scoreMessage = `Check out my score on today's listl: ${totalScore}/100`;
        const individualScores = userAnswers.map((answer, index) => `${index + 1}. ${scores[index].points}/${points[correctOrder[index].city][index]}`).join('\n');
        const shareText = `${scoreMessage}\n\n${individualScores}`;

        if (navigator.share) {
            navigator.share({
                title: 'Listl Score',
                text: shareText
            }).then(() => {
                alert('Score shared successfully!');
            }).catch((error) => {
                console.error('Error sharing score:', error);
                alert('Failed to share score.');
            });
        } else {
            alert('Share functionality is not supported on your device.');
        }
    });

    function calculateScore(userAnswers) {
        let score = 0;
        let scores = [];

        userAnswers.forEach((answer, index) => {
            const correctCity = correctOrder[index].city;
            const pointsEarned = points[answer][index];
            score += pointsEarned;
            scores.push({ answer, points: pointsEarned, correctCity });
        });
        return { score, scores };
    }

    function showCorrectAnswers(userAnswers, scores) {
        answersList.innerHTML = '';
        userAnswers.forEach((answer, index) => {
            const li = document.createElement('li');
            const userScore = scores[index].points;
            const maxScore = points[correctOrder[index].city][index];
            li.textContent = `${answer} (${correctOrder[index].city} - ${correctOrder[index].year}) ${userScore}/${maxScore}`;
            if (correctOrder[index].city === answer) {
                li.classList.add('correct');
            } else {
                li.classList.add('incorrect');
            }
            answersList.appendChild(li);
        });
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    displayAnswers();
});
