// Wartet, bis das HTML vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM geladen. Initialisiere Buttons...");
    initButtons();
    // Startet den Scanner automatisch beim Laden
    startScanner(); 
});

function initButtons() {
    // Falls ein Button im HTML fehlt, verhindert das "?." einen Skript-Absturz
    document.getElementById('mehr')?.addEventListener('click', todoHinzufuegen);
    document.getElementById('loeschen')?.addEventListener('click', allesLöschen);
    document.getElementById('senden')?.addEventListener('click', datenSenden);
    document.getElementById('scannen')?.addEventListener('click', startScanner);
    document.getElementById('invent')?.addEventListener('click', weiterleitungInventur);
    
    // Event-Listener für das manuelle Eintippen einer Artikelnummer
    document.getElementById('ArtNr')?.addEventListener('input', getArtDaten);
}

// Globaler Zustand für den Scanner
const codes = [];
const seen = new Set();
const scanIntervalTime = 100;
let myInterval = null;

// Barcode-Detector (Code 39 für Tempo-Etiketten)
let barcodeDetector = null;
try {
    barcodeDetector = new BarcodeDetector({ formats: ['code_39'] });
} catch (e) {
    console.error("BarcodeDetector wird von diesem Browser/Gerät nicht nativ unterstützt.", e);
}

function startScanner() {
    console.log("Scanner-Start angefordert...");
    const video = document.getElementById('video');
    
    if (!video) {
        console.error("HTML-Video-Element wurde nicht gefunden!");
        return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = {
            video: {
                facingMode: "environment", // Bevorzugt die Rückkamera am Handy
                width: { ideal: 480 },
                height: { ideal: 480 }
            },
            audio: false
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                video.srcObject = stream;
                video.play()
                    .then(() => {
                        console.log("Kamera-Stream läuft.");
                        // Intervall starten, falls der Browser Barcodes unterstützt
                        if (barcodeDetector && !myInterval) {
                            myInterval = setInterval(detectCode, scanIntervalTime);
                        }
                    })
                    .catch(e => console.error("Kamera-Wiedergabe blockiert:", e));
            })
            .catch(err => {
                console.error("Kamera-Zugriff fehlgeschlagen:", err);
                alert("Kamera konnte nicht gestartet werden. Bitte Berechtigung prüfen.");
            });
    } else {
        alert("Ihr Browser unterstützt keinen Kamera-Zugriff.");
    }
}

function stopScanner() {
    if (myInterval) {
        clearInterval(myInterval);
        myInterval = null;
    }
    const video = document.getElementById('video');
    if (video && video.srcObject) {
        const stream = video.srcObject;
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    drawCodePath({});
}

const detectCode = () => {
    const video = document.getElementById('video');
    if (!video || video.paused || video.ended || !barcodeDetector) return;

    barcodeDetector.detect(video)
        .then(detectedCodes => {
            if (detectedCodes.length === 0) {
                return drawCodePath({});
            }
            
            for (const barcode of detectedCodes) {
                if (seen.has(barcode.rawValue)) continue;
                
                // Barcode erfolgreich erkannt
                onBarcodeDetected(barcode);
                break; 
            }
        })
        .catch(err => console.error("Scanner-Fehler:", err));
};

function onBarcodeDetected(barcode) {
    const codeValue = barcode.rawValue;
    codes.push(barcode);
    seen.add(codeValue);
    
    if (typeof beep === 'function') beep();
    
    const artNrInput = document.getElementById('ArtNr');
    if (artNrInput) {
        artNrInput.value = codeValue;
        // Aktualisiert sofort die Artikeldaten (Einheit, Bezeichnung...) im Formular
        getArtDaten(); 
    }
    
    stopScanner();
}

function getArtDaten() {
    const artNrInput = document.getElementById("ArtNr");
    if (!artNrInput) return;
    
    const sucheArtNr = artNrInput.value.trim();
    // Greift auf die neue, von Access generierte Row-ID zu
    const artikelZeile = document.getElementById("Row" + sucheArtNr);

    if (artikelZeile) {
        const varEinheit = artikelZeile.dataset.einh || '-';
        const varBez = artikelZeile.dataset.bez || 'Unbekannter Artikel';
        const varGr = artikelZeile.dataset.gr || '-';
        const varBestMenge = artikelZeile.dataset.bestm || '';
        const varAusl = artikelZeile.dataset.ausl || 'Falsch';

        if (document.getElementById('ArtDatEinh')) document.getElementById('ArtDatEinh').textContent = varEinheit;
        if (document.getElementById('ArtDatBez')) document.getElementById('ArtDatBez').textContent = varBez;
        if (document.getElementById('ArtDatGr')) document.getElementById('ArtDatGr').textContent = varGr;
        
        const mengeInput = document.getElementById('Menge');
        if (mengeInput) {
            mengeInput.value = varBestMenge;
            mengeInput.focus(); // Setzt den Cursor direkt in das Mengenfeld
        }

        const idAuslauf = document.getElementById('idAuslauf');
        if (idAuslauf) {
            idAuslauf.style.display = (varAusl === 'Wahr') ? 'block' : 'none';
        }
    } else {
        if (document.getElementById('ArtDatBez')) {
            document.getElementById('ArtDatBez').textContent = sucheArtNr ? "Artikel nicht gefunden" : "Kein Artikel gescannt";
        }
    }
}

function todoHinzufuegen() {
    const eintraegeArray = holEintraege();
    const artNrInput = document.getElementById('ArtNr');
    const mengeInput = document.getElementById('Menge');

    if (!artNrInput || !mengeInput) return;

    const varArtNr = artNrInput.value.trim();
    const varMenge = parseFloat(mengeInput.value);       

    if (varArtNr !== '' && !isNaN(varMenge) && varMenge !== 0) {
        const aufgabeText = { 'value': varMenge };
        localStorage.setItem(varArtNr, JSON.stringify(aufgabeText));
        
        if (!eintraegeArray.includes(varArtNr)) {
            eintraegeArray.push(varArtNr);
            localStorage.setItem('eintraegeArray', JSON.stringify(eintraegeArray));
        }
        
        insDOMschreiben(varArtNr, aufgabeText);
        artNrInput.value = '';
        mengeInput.value = '';       
        if (document.getElementById('ArtDatBez')) document.getElementById('ArtDatBez').textContent = '';
    }
}

function todoLoeschen(e) {
    const aufgabeNr = e.target.id;
    let eintraegeArray = holEintraege();
    eintraegeArray = eintraegeArray.filter(item => item !== aufgabeNr);
    
    localStorage.removeItem(aufgabeNr);
    localStorage.setItem('eintraegeArray', JSON.stringify(eintraegeArray));
    ausDOMentfernen(aufgabeNr);
}

function insDOMschreiben(aufgabeNr, itemObj) {
    const eintraege = document.getElementById('eintraege');
    if (!eintraege) return;

    const artikelZeile = document.getElementById("Row" + aufgabeNr);
    const varEinheit = artikelZeile ? artikelZeile.dataset.einh : '-';
    const varBez = artikelZeile ? artikelZeile.dataset.bez : 'Unbekannter Artikel';
    const varGr = artikelZeile ? artikelZeile.dataset.gr : '-';

    const alteZeile = document.getElementById('X' + aufgabeNr);
    if (alteZeile) alteZeile.remove();

    const eintrNeueZeile = document.createElement('tr');
    eintrNeueZeile.id = 'X' + aufgabeNr;

    const eintrDel = document.createElement('td');
    eintrDel.textContent = 'X';
    eintrDel.id = aufgabeNr;
    eintrDel.style.cursor = 'pointer';
    eintrDel.addEventListener('click', todoLoeschen);

    const eintrArtNr = document.createElement('td');
    eintrArtNr.textContent = aufgabeNr;

    const eintrMenge = document.createElement('td');
    eintrMenge.textContent = itemObj.value;

    const eintrEinh = document.createElement('td');
    eintrEinh.textContent = varEinheit;

    const eintrBez = document.createElement('td');
    eintrBez.textContent = varBez;

    const eintrGr = document.createElement('td');
    eintrGr.textContent = varGr;

    eintrNeueZeile.append(eintrDel, eintrArtNr, eintrMenge, eintrEinh, eintrBez, eintrGr);
    eintraege.appendChild(eintrNeueZeile);
}

function holEintraege() {
    const eintraegeStr = localStorage.getItem('eintraegeArray');
    if (!eintraegeStr) {
        const leererArray = [];
        localStorage.setItem('eintraegeArray', JSON.stringify(leererArray));
        return leererArray;
    }
    try { return JSON.parse(eintraegeStr); } catch (e) { return []; }
}

function ausDOMentfernen(aufgabeNr) {
    document.getElementById('X' + aufgabeNr)?.remove();
}

function allesLöschen() {
    localStorage.clear();
    const itemList = document.getElementById('eintraege');
    if (itemList) itemList.innerHTML = '';
    holEintraege();
}

function datenSenden() {
    let body = 'Bestellliste:\nANFANG:\n';	
    const eintraegeArray = holEintraege();
    
    eintraegeArray.forEach(aufgabeNr => {
        const itemStr = localStorage.getItem(aufgabeNr);
        if (itemStr) {
            try {
                const value = JSON.parse(itemStr);
                body += `ArtNr:${aufgabeNr};Menge:${value.value}EH\n`;
            } catch(e) {}
        }
    });
    
    body += 'ENDE';
    const mailBetreff = 'Bestellliste ' + formatUhrzeit();
    window.location.href = `mailto:office@://tempo-luft.com{encodeURIComponent(mailBetreff)}&body=${encodeURIComponent(body)}`;
    allesLöschen();
}

function formatUhrzeit() {
    const jetzt = new Date();
    const fNull = (z) => z < 10 ? '0' + z : z;
return ${jetzt.getFullYear()}.${fNull(jetzt.getMonth() + 1)}.${fNull(jetzt.getDate())} ${fNull(jetzt.getHours())}:${fNull(jetzt.getMinutes())}:${fNull(jetzt.getSeconds())};
}
const drawCodePath = ({ cornerPoints }) => {
if (!canvas) return;
const ctx = canvas.getContext('2d');
if (!ctx) return;
ctx.clearRect(0, 0, canvas.width, canvas.height);
if (!cornerPoints || cornerPoints.length === 0) return;
ctx.strokeStyle = "red";
ctx.lineWidth = 4;
ctx.beginPath();
for (const [i, { x, y }] of cornerPoints.entries()) {
if (i === 0) { ctx.moveTo(x - ctx.lineWidth / 2, y); continue; }
ctx.lineTo(x, y);
if (i === cornerPoints.length - 1) ctx.lineTo(cornerPoints[0].x, cornerPoints[0].y);
}
ctx.stroke();
};
function weiterleitungInventur() {
window.location.href = "github.io";
}