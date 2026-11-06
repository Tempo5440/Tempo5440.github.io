// Globale Variable für die Artikelstammdaten im Arbeitsspeicher
let artikelStammdaten = {};
let zeilenZaehler = 1;

// Wartet, bis das HTML vollständig geladen ist
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // 1. Stammdaten asynchron aus der JSON-Datei laden
    await ladeStammdaten();

    // 2. Event-Listener für alle Buttons registrieren
    const buttons = {
        'mehr': todoHinzufuegen,
        'loeschen': allesLoeschen,
        'senden': datenSendenInv,
        'scannen': scanStarten,
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
        const response = await fetch('./inv.json');
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
    const bestMFeld = document.getElementById('Menge');
    const auslaufHinweis = document.getElementById('idAuslauf');

    if (!artNrInput) return;

    const artNr = artNrInput.value.trim();
    const artikel = artikelStammdaten[artNr];

    if (artikel) {
        // Artikel gefunden -> UI-Textfelder befüllen
        if (einhFeld) einhFeld.textContent = artikel.einh || '';
        if (bezFeld) bezFeld.textContent = artikel.bez || '';
        if (grFeld) grFeld.textContent = artikel.gr || '';
        if (bestMFeld) bestMFeld.value = artikel.bestM || '';
        if (auslaufHinweis) {
            auslaufHinweis.style.display = artikel.ausl ? 'block' : 'none';
        }
        artNrInput.style.borderColor = ""; // Standard-Design bei Treffer
    } else {
        // Wenn das Feld leer ist oder nichts gefunden wurde -> Felder leeren
        if (einhFeld) einhFeld.textContent = '';
        if (bezFeld) bezFeld.textContent = '';
        if (grFeld) grFeld.textContent = '';
        if (bestMFeld) bestMFeld.value = '';
        if (auslaufHinweis) auslaufHinweis.style.display = 'none';
        
        // Optisches Feedback: Wenn eine Nummer eingegeben wurde, die es nicht gibt
        if (artNr !== '') {
            artNrInput.style.borderColor = "red"; // Signalisiert einen unbekannten Artikel
        } else {
            artNrInput.style.borderColor = "";
        }
    }
}


//function scanStarten() {
		// Get video element 
//		const video = document.getElementById('video');
//		video.play();
//}

function scanStarten() {
  // 1. Vorheriges Intervall zur Sicherheit löschen, falls es noch läuft
  clearInterval(myInterval);
  
  // 2. Das Set der bereits gescannten Codes zurücksetzen
  seen.clear();
  
  // 3. Canvas-Zeichnung der roten Linien löschen (falls vorhanden)
  if (typeof drawCodePath === 'function') {
    drawCodePath({});
  }
  
  // 4. Video-Stream fortsetzen, falls er pausiert war
  const video = document.getElementById('video');
  if (video) {
    video.play().catch(err => console.error("Kamera konnte nicht gestartet werden:", err));
  }
  
  // 5. Intervall neu starten und der globalen Variable zuweisen
  myInterval = setInterval(detectCode, intZeitIntervall || 100);
  
  console.log("Scanner wurde reaktiviert.");
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
    scanStarten(); //Video neu starten
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
    //const alteZeile = document.getElementById('X' + aufgabeNr);
    //if (alteZeile) alteZeile.remove();

    // 3. Neue Tabellenzeile (tr) erstellen
    const eintrNeueZeile = document.createElement('tr');
    eintrNeueZeile.id = 'X' + zeilenZaehler;

    // 4. Lösch-Zelle (td) erstellen und Event-Listener binden
    const eintrDel = document.createElement('td');
    eintrDel.textContent = 'X';
    eintrDel.id = 'X' + zeilenZaehler;
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

	// 8. ID um 1 erhöhen
	zeilenZaehler++;
}


function ausDOMentfernen(aufgabeNr) {
    const eintrag = document.getElementById('X' + aufgabeNr + zeilenZaehler);
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


function datenSendenInv() {
    let body = 'Inventurliste:\nANFANG:\n';	
    const eintraegeArray = holEintraege();
    
    eintraegeArray.forEach(item => {
   
    const artNr = item.aufgabeNr; // Nimmt die Nummer des aktuellen Eintrags
    const menge = item.value;     // Nimmt die Menge genau dieses Eintrags
    
    body += `ArtNr:${artNr};Menge:${menge}EH\n`;
    });
    
    body += 'ENDE';
    const mailBetreff = 'Inventurliste ' + formatUhrzeit();
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
