const canvas = document.getElementById("canvas");
const clearButton = document.getElementById("clear_board_btn");
const explosionNuclearBombe = document.createElement('audio');
const nyanCatAudio = document.createElement('audio');
const borderDivs = document.querySelectorAll('div.border');
const title = document.getElementById("title");
const ctx = canvas.getContext("2d");
const pixelSize = 10;
const user = {};
let color = getRandomRGB();

const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pseudo = urlParams.get('pseudo');
    if (pseudo === null) {
        goIndex();
    }
    removeParameterFromURL("pseudo");
    ws.send(JSON.stringify({action: "firstConnexion", data: {pseudo: pseudo}}));
}

ws.onclose = () => {
    ws.send(JSON.stringify({action: "lastConnexion", data: {idPseudo: user.id}}));
}

canvas.addEventListener("click", event => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / pixelSize) * pixelSize;
    const y = Math.floor((event.clientY - rect.top) / pixelSize) * pixelSize;

    const id = `${x},${y}`;

    const data = {action: "draw", data: {id, x, y, color: color}};

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
});

clearButton.addEventListener("click", event => {
    explosionNuclearBomb();
    nyanCat();

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({action: "clear"}));
    }
});

explosionNuclearBombe.addEventListener('ended', function() {
    document.body.removeChild(explosionNuclearBombe);
});

ws.onmessage = event => {
    const {action, data} = JSON.parse(event.data);
    if (action === "draw") {
        ctx.fillStyle = data.color;
        ctx.fillRect(data.x, data.y, 10, 10);
    }
    if (action === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (action === "getClientId") {
        user.id = data.clientId;
        user.pseudo = data.pseudo;
        title.innerText = user.pseudo;
    }
    if (action === "redirect") {
        goIndex();
    }
};

borderDivs.forEach(div => {
    div.addEventListener('click', function () {
        const borderColor = window.getComputedStyle(div).borderColor;
        if (borderColor.includes('a')) {
            color = getRandomRGB();
        } else {
            color = borderColor;
        }
    });
});

function getRandomRGB() {
    return `rgb(${getRandomNumber(255)}, ${getRandomNumber(255)}, ${getRandomNumber(255)})`;
}

function getRandomNumber(max, min = 0) {
    return Math.floor(Math.random() * max) + min;
}

function removeParameterFromURL(parameterName) {
    const url = new URL(window.location.href);
    url.searchParams.delete(parameterName);
    history.replaceState({}, '', url);
}

function goIndex() {
    window.location.href = "index.html";
}

function explosionNuclearBomb() {
    const atomicExplosion = document.createElement('img');
    atomicExplosion.src = "./public/atomic-explosion.gif";
    atomicExplosion.style.width = "100%";
    atomicExplosion.style.position = "fixed";
    atomicExplosion.style.top = "60px";
    atomicExplosion.style.zIndex = "9999999";
    document.body.appendChild(atomicExplosion);
    atomicExplosion.onload = function () {
        setTimeout(function () {
            document.body.removeChild(atomicExplosion);
        }, 4000);
    };

    explosionNuclearBombe.src = './public/bruit-explosion.mp3';
    explosionNuclearBombe.autoplay = true;
    document.body.appendChild(explosionNuclearBombe);
}

function nyanCat() {
    const nyanCat = document.createElement('img');
    nyanCat.src = "./public/nyan-cat.gif";
    nyanCat.style.width = "100%";
    nyanCat.style.position = "fixed";
    nyanCat.style.top = "60px";
    nyanCat.style.zIndex = "9999999";
    document.body.appendChild(nyanCat);
    nyanCat.onload = function () {
        setTimeout(function () {
            document.body.removeChild(nyanCat);
        }, 4000);
    };

    nyanCatAudio.src = './public/nyan-cat.mp3';
    nyanCatAudio.autoplay = true;
    document.body.appendChild(nyanCatAudio);

    setTimeout(function() {
        nyanCatAudio.currentTime = 10;
    });

    setTimeout(function () {
        document.body.removeChild(nyanCatAudio);
    }, 4000);
}