// Zustand & Konfiguration
const codes = [];
const seen = new Set();
const scanIntervalTime = 100;
let myInterval = null;

// Barcode Detector initialisieren
const barcodeDetector = new BarcodeDetector({ formats: ['code_39'] });

// DOM Elemente cachen
const video = document.getElementById('video');
const canvas = document.querySelector('#canvas');
const artNrInput = document.getElementById('ArtNr');
const mengeInput = document.getElementById('Menge');
const idAuslauf = document.getElementById('idAuslauf');

const artDatEinh = document.getElementById('ArtDatEinh');
const artDatBez = document.getElementById('ArtDatBez');
const artDatGr = document.getElementById('ArtDatGr');

/**
 * Verarbeitet einen erfolgreich erkannten und neuen Barcode
 */
function onBarcodeDetected(barcode) {
    const codeValue = barcode.rawValue;
    
    // In den lokalen Speicher (Array & Set) pushen
    codes.push(barcode);
    seen.add(codeValue);
    
    // Signalton abspielen
    if (typeof beep === 'function') beep();
    
    // Eingabefeld befüllen
    if (artNrInput) artNrInput.value = codeValue;
    
    // Stammdaten aus dem DOM auslesen (Sicherheitsabfragen mit ?.)
    const einhElem = document.getElementById("Einh" + codeValue);
    const bezElem = document.getElementById("Bez" + codeValue);
    const grElem = document.getElementById("Gr" + codeValue);
    const bestMElem = document.getElementById("BestM" + codeValue);
    const auslElem = document.getElementById("Ausl" + codeValue);
    
    // Daten anzeigen (Fallbacks definieren, falls Artikel nicht existiert)
    if (artDatEinh) artDatEinh.textContent = einhElem ? einhElem.textContent : '-';
    if (artDatBez) artDatBez.textContent = bezElem ? bezElem.textContent : 'Unbekannter Artikel';
    if (artDatGr) artDatGr.textContent = grElem ? grElem.textContent : '-';
    if (mengeInput) mengeInput.value = bestMElem ? bestMElem.textContent : '';
    
    // Auslaufartikel-Warnung prüfen (prüft auf den String "Wahr")
    if (idAuslauf) {
        const isAuslauf = auslElem ? auslElem.textContent.trim() === 'Wahr' : false;
        idAuslauf.style.display = isAuslauf ? 'block' : 'none';
    }
    
    // Scanner stoppen
    stopScanner();
}

/**
 * Zeichnet den roten Rahmen um den erkannten Barcode
 */
const drawCodePath = ({ cornerPoints }) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Canvas leeren, wenn keine Punkte übergeben wurden
    if (!cornerPoints || cornerPoints.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    for (const [i, { x, y }] of cornerPoints.entries()) {
        if (i === 0) {
            ctx.moveTo(x - ctx.lineWidth / 2, y);
            continue;
        }
        ctx.lineTo(x, y);
        
        // Pfad zur Startposition schließen
        if (i === cornerPoints.length - 1) {
            ctx.lineTo(cornerPoints[0].x, cornerPoints[0].y);
        }
    }
    ctx.stroke();
};

/**
 * Scan-Funktion (wird im Intervall aufgerufen)
 */
const detectCode = () => {
    if (!video || video.paused || video.ended) return;

    barcodeDetector.detect(video)
        .then(detectedCodes => {
            if (detectedCodes.length === 0) {
                return drawCodePath({});
            }
            
            for (const barcode of detectedCodes) {
                console.log("Barcode gefunden:", barcode);
                
                // Optional: Umriss zeichnen (falls gewünscht, auskommentieren)
                // drawCodePath(barcode);
                
                // Wenn der Code in dieser Session bereits verarbeitet wurde, überspringen
                if (seen.has(barcode.rawValue)) continue;
                
                // Erfolgskette auslösen
                onBarcodeDetected(barcode);
                break; // Schleife abbrechen, da Scanner jetzt stoppt
            }
        })
        .catch(err => {
            console.error("Fehler bei der Barcode-Erkennung:", err);
        });
};

/**
 * Kamera-Stream starten und Scanner aktivieren
 */
function startScanner() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = {
            video: {
                facingMode: "environment", // "environment" bevorzugt Umgebungskamera ohne harten Fehler am PC
                width: { ideal: 480 },
                height: { ideal: 480 }
            },
            audio: false
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                if (video) {
                    video.srcObject = stream;
                    video.play()
                        .then(() => {
                            // Intervall starten, sobald das Video wirklich läuft
                            if (!myInterval) {
                                myInterval = setInterval(detectCode, scanIntervalTime);
                            }
                        })
                        .catch(e => console.error("Video-Play fehlgeschlagen:", e));
                }
            })
            .catch(err => {
                console.error("Kamera-Zugriff verweigert oder nicht verfügbar:", err);
            });
    }
}

/**
 * Kamera stoppen und Intervall löschen
 */
function stopScanner() {
    if (myInterval) {
        clearInterval(myInterval);
        myInterval = null;
    }
    if (video) {
        video.pause();
        const stream = video.srcObject;
        if (stream) {
            // Alle Kamera-Tracks sauber beenden (schaltet die Handy-Kamera-LED ab)
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
    }
    // Canvas nach dem Stoppen leeren
    drawCodePath({});
}

// Scanner beim Laden oder per Funktionsaufruf starten
// startScanner();
