// Globale Variable für die Artikelstammdaten im Arbeitsspeicher
let artikelStammdaten = {};

// Wartet, bis das HTML vollständig geladen ist
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // 1. Stammdaten asynchron aus der JSON-Datei laden
    await ladeStammdaten();

    // 2. Event-Listener für alle Buttons registrieren
    const buttons = {
        'mehr': todoHinzufuegen,
        'loeschen': allesLoeschen,
        'senden': datenSenden,
        'scannen': scanStarten,
        'invent': weiterleitungInventur
    };

    Object.entries(buttons).forEach(([id, handler]) => {
        document.getElementById(id)?.addEventListener('click', handler);
    });

    // 3. Überwachung für manuelle Eingaben und Scanner-Inputs einrichten
    const artNrInput = document.getElementById('ArtNr');
    if (artNrInput) {
        // 'input' reagiert sofort auf Tastatur, Kopieren/Einfügen und Scanner-Inhalte
        artNrInput.addEventListener('input', getArtDaten);
    }

    // 4. Bereits gescannte Artikel aus dem LocalStorage in der Liste anzeigen
    ladenUndRendern();
}

// Lädt die JSON-Datei einmalig beim App-Start in den Speicher
async function ladeStammdaten() {
    try {
        const response = await fetch('./artikelstammdaten.json');
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        artikelStammdaten = await response.json();
        console.log(`${Object.keys(artikelStammdaten).length} Artikelstammdaten erfolgreich geladen.`);
    } catch (error) {
        console.error("Fehler beim Laden der Artikelstammdaten-JSON:", error);
    }
}

// Holt die Artikeldaten bei jeder Eingabe (manuell + Scanner) live aus dem Speicher
function getArtDaten() {
    const artNrInput = document.getElementById('ArtNr');
    const einhFeld = document.getElementById('ArtDatEinh');
    const bezFeld = document.getElementById('ArtDatBez');
    const grFeld = document.getElementById('ArtDatGr');
    const auslaufHinweis = document.getElementById('idAuslauf');

    if (!artNrInput) return;

    const artNr = artNrInput.value.trim();
    const artikel = artikelStammdaten[artNr];

    if (artikel) {
        // Artikel gefunden -> UI-Textfelder befüllen
        if (einhFeld) einhFeld.textContent = artikel.einh || '';
        if (bezFeld) bezFeld.textContent = artikel.bez || '';
        if (grFeld) grFeld.textContent = artikel.gr || '';
        if (auslaufHinweis) {
            auslaufHinweis.style.display = artikel.ausl ? 'block' : 'none';
        }
        artNrInput.style.borderColor = ""; // Standard-Design bei Treffer
    } else {
        // Wenn das Feld leer ist oder nichts gefunden wurde -> Felder leeren
        if (einhFeld) einhFeld.textContent = '';
        if (bezFeld) bezFeld.textContent = '';
        if (grFeld) grFeld.textContent = '';
        if (auslaufHinweis) auslaufHinweis.style.display = 'none';
        
        // Optisches Feedback: Wenn eine Nummer eingegeben wurde, die es nicht gibt
        if (artNr !== '') {
            artNrInput.style.borderColor = "red"; // Signalisiert einen unbekannten Artikel
        } else {
            artNrInput.style.borderColor = "";
        }
    }
}

function scanStarten() {
		// Get video element 
		const video1 = document.getElementById('video');
		video1.play();
}

function weiterleitungInventur() {
    window.location.href = "https://tempo5440.github.io/inventur.html";
}

function holEintraege() {
    const eintraegeStr = localStorage.getItem('eintraegeArray');
    if (!eintraegeStr) return [];
    try {
        return JSON.parse(eintraegeStr);
    } catch (e) {
        return [];
    }
}

function todoHinzufuegen() {
    const artNrInput = document.getElementById('ArtNr');
    const mengeInput = document.getElementById('Menge');

    if (!artNrInput || !mengeInput) return;

    const varArtNr = artNrInput.value.trim();
    const varMenge = parseFloat(mengeInput.value);       

    if (varArtNr === '' || isNaN(varMenge) || varMenge === 0) return;

    const eintraegeArray = holEintraege();

    if (!eintraegeArray.includes(varArtNr)) {
        eintraegeArray.push(varArtNr);
        localStorage.setItem('eintraegeArray', JSON.stringify(eintraegeArray));
    }

    const artikelDaten = { 'value': varMenge };
    localStorage.setItem(varArtNr, JSON.stringify(artikelDaten));

    if (typeof insDOMschreiben === 'function') {
        insDOMschreiben(varArtNr, artikelDaten);
    }

    // Felder zurücksetzen für den nächsten Artikel
    artNrInput.value = '';
    mengeInput.value = '';
    ScanStarten(); //Video neu starten
    //getArtDaten(); // Löscht die Einheiten- und Bezeichnungsfelder im HTML
    //artNrInput.focus();
}

function ladenUndRendern() {
    const eintraegeArray = holEintraege();
    eintraegeArray.forEach(aufgabeNr => {
        const itemStr = localStorage.getItem(aufgabeNr);
        if (!itemStr) return;
        try {
            const value = JSON.parse(itemStr);
            if (typeof insDOMschreiben === 'function') {
                insDOMschreiben(aufgabeNr, value);
            }
        } catch (e) {
            console.error(`Fehler beim Parsen von Artikel ${aufgabeNr}:`, e);
        }
    });
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

    // 1. Daten direkt aus dem globalen JSON-Arbeitsspeicher (artikelStammdaten) holen
    const artikel = artikelStammdaten[aufgabeNr];
    
    // Fallback-Werte setzen, falls die Artikelnummer im JSON nicht existiert
    const varEinheit = artikel ? (artikel.einh || '-') : '-';
    const varBez     = artikel ? (artikel.bez || 'Unbekannter Artikel') : 'Unbekannter Artikel';
    const varGr      = artikel ? (artikel.gr || '-') : '-';

    // 2. Bestehende Zeile löschen, falls der Artikel aktualisiert wird
    const alteZeile = document.getElementById('X' + aufgabeNr);
    if (alteZeile) alteZeile.remove();

    // 3. Neue Tabellenzeile (tr) erstellen
    const eintrNeueZeile = document.createElement('tr');
    eintrNeueZeile.id = 'X' + aufgabeNr;

    // 4. Lösch-Zelle (td) erstellen und Event-Listener binden
    const eintrDel = document.createElement('td');
    eintrDel.textContent = 'X';
    eintrDel.id = aufgabeNr;
    eintrDel.style.cursor = 'pointer';
    eintrDel.addEventListener('click', todoLoeschen);

    // 5. restliche Datenzellen (td) erstellen
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

    // 6. Zellen der Zeile hinzufügen
    eintrNeueZeile.appendChild(eintrDel);
    eintrNeueZeile.appendChild(eintrArtNr);
    eintrNeueZeile.appendChild(eintrMenge);
    eintrNeueZeile.appendChild(eintrEinh);
    eintrNeueZeile.appendChild(eintrBez);
    eintrNeueZeile.appendChild(eintrGr);

    // 7. Zeile in die Tabelle einfügen
    eintraege.appendChild(eintrNeueZeile);
}


function ausDOMentfernen(aufgabeNr) {
    const eintrag = document.getElementById('X' + aufgabeNr);
    if (eintrag) eintrag.remove();
}

function allesLoeschen() {
    localStorage.clear();
    const itemList = document.getElementById('eintraege');
    if (itemList) {
        itemList.innerHTML = '';
    }
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
    const to = 'office@tempo-luft.com';
    
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(mailBetreff)}&body=${encodeURIComponent(body)}`;
    allesLoeschen();
}


function formatUhrzeit() {
    const jetzt = new Date();
    const h = fuehrendeNull(jetzt.getHours());
    const m = fuehrendeNull(jetzt.getMinutes());
    const s = fuehrendeNull(jetzt.getSeconds());
    const jahr = jetzt.getFullYear();
    const monat = fuehrendeNull(jetzt.getMonth() + 1);
    const tag = fuehrendeNull(jetzt.getDate());
    
    return `${jahr}.${monat}.${tag} ${h}:${m}:${s}`;
}

function fuehrendeNull(zahl) {
    return zahl < 10 ? '0' + zahl : zahl;  
}


let codes = [];
var intZeitIntervall = 100;
const seen = new Set();
// Create new barcode detector
const barcodeDetector = new BarcodeDetector({ formats: ['code_39'] });

// Codes proxy/state
const codesProxy = new Proxy(codes, {
  set (target, prop, value, receiver) {
    // Throw err if value is a number
    // Stops from saving undefined codes
    if (typeof value === 'number') throw value;
    
    target.push(value);

    // Check if code has already been scanned
    target = target.filter((c) => {
      if (c.rawValue !== window.barcodeVal) return c;
      const d = seen.has(c.rawValue);
      seen.add(c.rawValue);
      return !d;
    });
    
    //Scanergebnis eintragen und gefundenen Artikel anzeigen
    beep();
    
    // DOM-Elemente holen
    const artNrInput = document.getElementById('ArtNr');
    const artDatEinh = document.getElementById('ArtDatEinh');
    const artDatBez  = document.getElementById('ArtDatBez');
    const artDatGr   = document.getElementById('ArtDatGr');
    const mengeInput = document.getElementById('Menge');
    const auslaufHinweis = document.getElementById('idAuslauf');

    const scannVal = value.rawValue;
    if (artNrInput) artNrInput.value = scannVal;

    // NEU: Daten direkt aus dem globalen JSON-Speicherobjekt abfragen
    // 'artikelStammdaten' wurde in TempoScan.js global via ladeStammdaten() befüllt
    const artikel = (typeof artikelStammdaten !== 'undefined' && artikelStammdaten[scannVal]) ? artikelStammdaten[scannVal] : null;

    if (artikel) {
        if (artDatEinh) artDatEinh.textContent = artikel.einh || '';
        if (artDatBez)  artDatBez.textContent  = artikel.bez || '';
        if (artDatGr)   artDatGr.textContent   = artikel.gr || '';
        if (mengeInput) mengeInput.value       = artikel.bestM !== undefined ? artikel.bestM : '';
        if (auslaufHinweis) {
            auslaufHinweis.style.display = artikel.ausl ? 'block' : 'none';
        }
        if (artNrInput) artNrInput.style.borderColor = "";
    } else {
        // Fallback: Artikelnummer existiert nicht in der JSON
        if (artDatEinh) artDatEinh.textContent = '';
        if (artDatBez)  artDatBez.textContent  = 'Unbekannter Artikel';
        if (artDatGr)   artDatGr.textContent   = '';
        if (mengeInput) mengeInput.value       = '';
        if (auslaufHinweis) auslaufHinweis.style.display = 'none';
        if (artNrInput) artNrInput.style.borderColor = "red";
    }
    
    clearInterval(myInterval);
    if (video) video.pause();
    return true;
  }
});

// Get video element 
const video = document.getElementById('video');

// Kamera auswählen und auf rückseitige Kamera wechseln
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  const constraints = {
	video: true,
    video: {
      facingMode: "environment", 
      width: 480, height: 480
    },
    audio: false
  };
  
 // Start video stream
  navigator.mediaDevices.getUserMedia(constraints).then(stream => video.srcObject = stream);
}

// Barcode-Ränder zeichnen 
const drawCodePath = ({cornerPoints}) => {
  const canvas = document.querySelector('#canvas');
  const ctx = canvas.getContext('2d');
  const strokeGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  
  // Exit function and clear canvas if no corner points
  if (!cornerPoints) return ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Clear canvas for new redraw
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Create new gradient
  strokeGradient.addColorStop('0', 'red');
  strokeGradient.addColorStop('1', 'red');

  // Define stoke styles
  ctx.strokeStyle = "red";
  //ctx.strokeStyle = strokeGradient;
  ctx.lineWidth = 4;

  // Begin draw
  ctx.beginPath();

  // Draw code outline path
  for (const [i, {x, y}] of cornerPoints.entries()) {
    if (i === 0) {
      // Move x half of the stroke width back 
      // makes the start and end corner line up
      ctx.moveTo(x - ctx.lineWidth/2, y);
      continue;
    }

    // Draw line from current pos to x, y
    ctx.lineTo(x, y);

    // Complete square draw to starting position
    if (i === cornerPoints.length-1) ctx.lineTo(cornerPoints[0].x, cornerPoints[0].y);
  }

  // Make path to stroke
  ctx.stroke();
}

// Detect code function 
const detectCode = () => {
  barcodeDetector.detect(video).then(codes => {
    // If no codes exit function and clear canvas
    if (codes.length === 0) return drawCodePath({});
    
    for (const barcode of codes)  {
      console.log(barcode)
      // Draw outline
      //drawCodePath(barcode);
      
      // Code in seen set then exit loop 
       if (seen.has(barcode.rawValue)) return;

      // Save barcode to window to use later on
      // then push to the codes proxy
      window.barcodeVal = barcode.rawValue;
      codesProxy.push(barcode);
    }
  }).catch(err => {
    console.error(err);
  })
}

// Run detect code function every 100 milliseconds
const myInterval = setInterval(detectCode, 100);

function beep() {
    // Die Audio-Daten für den Beep-Sound finden sich in den ursprünglichen Web-Dokumenten.
    const snd = new Audio("data:audio/wav;base64,...");
    snd.play().catch(e => console.log("Audio-Play blockiert, erfordert vorherige Nutzerinteraktion."));
}



