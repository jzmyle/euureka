let currentClass = "";
let points = {};
let userType = "";
let socket = io(); // Conecta ao servidor Socket.IO

// Atualiza a tela com os pontos mais recentes
socket.on('pointsUpdated', (classId, updatedPoints) => {
    if (currentClass === classId) {
        points[classId] = updatedPoints;
        updateClassPoints();
    }
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'block';
}

function selectUserType(type) {
    userType = type;
    document.body.classList.toggle('student-mode', userType === 'aluno');
    screenHistory.push('home-screen');
    if (type === 'professor') {
        showScreen('professor-login-screen');
    } else {
        showScreen('class-selection-screen');
    }
}

function verifyProfessorCode() {
    const code = document.getElementById('professor-code').value;
    if (code === 'eremcode') {
        screenHistory.push('professor-login-screen');
        showScreen('class-selection-screen');
    } else {
        alert('Código incorreto');
    }
}

function selectClass(classId) {
    currentClass = classId;
    loadClassData();
    screenHistory.push('class-selection-screen');
    showScreen('points-management-screen');
    document.getElementById('class-name').innerText = `Turma ${classId}`;

    if (userType === 'aluno') {
        document.getElementById('annotations').disabled = true;
        document.body.classList.add('student-mode');
    } else if (userType === 'professor') {
        document.getElementById('annotations').disabled = false;
        document.body.classList.remove('student-mode');
    }
}

function addPoints(value) {
    if (userType === 'professor') {
        points[currentClass] = (points[currentClass] || 0) + value;
        updateClassPoints();
        savePoints();
        socket.emit('updatePoints', currentClass, points[currentClass]);
    }
}

function subtractPoints(value) {
    if (userType === 'professor') {
        points[currentClass] = (points[currentClass] || 0) - value;
        updateClassPoints();
        savePoints();
        socket.emit('updatePoints', currentClass, points[currentClass]);
    }
}

function showPositiveActions() {
    screenHistory.push('points-management-screen');
    showScreen('positive-actions-screen');
}

function showNegativeActions() {
    screenHistory.push('points-management-screen');
    showScreen('negative-actions-screen');
}

function showCustomPositiveAction() {
    document.getElementById('positive-actions-screen').style.display = 'none';
    document.getElementById('custom-positive-action-screen').style.display = 'block';
}

function addCustomPoints() {
    const description = document.getElementById('custom-positive-description').value;
    const pointsToAdd = parseInt(document.getElementById('custom-positive-points').value, 10);

    if (description && pointsToAdd > 0) {
        addPoints(pointsToAdd);
        alert(`Atividade: ${description}\nPontuação: ${pointsToAdd} pontos`);
        document.getElementById('custom-positive-action-screen').style.display = 'none';
        document.getElementById('positive-actions-screen').style.display = 'block';
    } else {
        alert('Por favor, preencha a descrição e a pontuação válida.');
    }
}

function showCustomNegativeAction() {
    document.getElementById('negative-actions-screen').style.display = 'none';
    document.getElementById('custom-negative-action-screen').style.display = 'block';
}

function subtractCustomPoints() {
    const description = document.getElementById('custom-negative-description').value;
    const pointsToSubtract = parseInt(document.getElementById('custom-negative-points').value, 10);

    if (description && pointsToSubtract > 0) {
        subtractPoints(pointsToSubtract);
        alert(`Atividade: ${description}\nPontuação: ${pointsToSubtract} pontos`);
        document.getElementById('custom-negative-action-screen').style.display = 'none';
        document.getElementById('negative-actions-screen').style.display = 'block';
    } else {
        alert('Por favor, preencha a descrição e a pontuação válida.');
    }
}

function updateClassPoints() {
    document.getElementById('class-points').innerText = points[currentClass] || 0;
}

function loadClassData() {
    points[currentClass] = parseInt(localStorage.getItem(`points-${currentClass}`)) || 0;
    updateClassPoints();
    document.getElementById('annotations').value = localStorage.getItem(`annotations-${currentClass}`) || "";
}

function savePoints() {
    localStorage.setItem(`points-${currentClass}`, points[currentClass]);
}

function saveAnnotations() {
    if (userType === 'professor') {
        const annotations = document.getElementById('annotations').value;
        localStorage.setItem(`annotations-${currentClass}`, annotations);
        alert('Anotações salvas com sucesso!');
    }
}

function goBack() {
    if (screenHistory.length > 0) {
        const previousScreen = screenHistory.pop();
        showScreen(previousScreen);
    }
}

// Inicializa a tela inicial
showScreen('home-screen');
