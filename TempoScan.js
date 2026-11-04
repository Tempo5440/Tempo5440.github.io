document.addEventListener('DOMContentLoaded', init);

function init() {
    const eintraegeArray = holEintraege();
    eintraegeArray.forEach(aufgabeNr => {
        const itemStr = localStorage.getItem(aufgabeNr);
        if (itemStr) {
            try {
                const value = JSON.parse(itemStr);
                insDOMschreiben(aufgabeNr, value);
            } catch (e) {
                console.error(`Fehler beim Parsen von Artikel ${aufgabeNr}:`, e);
            }
        }
    });

    document.getElementById('mehr')?.addEventListener('click', todoHinzufuegen);
    document.getElementById('loeschen')?.addEventListener('click', allesLoeschen);
    document.getElementById('senden')?.addEventListener('click', datenSenden);
    document.getElementById('scannen')?.addEventListener('click', scanStarten);
    document.getElementById('invent')?.addEventListener('click', weiterleitungInventur);
}

function scanStarten() {
    const video1 = document.getElementById('video');
    if (video1) video1.play().catch(err => console.error("Video-Play fehlgeschlagen:", err));
}

function weiterleitungInventur() {
    window.location.href = "https://tempo5440.github.io/inventur.html";
}

function holEintraege() {
    const eintraegeStr = localStorage.getItem('eintraegeArray');
    if (!eintraegeStr) {
        const leererArray = [];
        localStorage.setItem('eintraegeArray', JSON.stringify(leererArray));
        return leererArray;
    }
    try {
        return JSON.parse(eintraegeStr);
    } catch (e) {
        return [];
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

    const einhElem = document.getElementById('Einh' + aufgabeNr);
    const bezElem = document.getElementById('Bez' + aufgabeNr);
    const grElem = document.getElementById('Gr' + aufgabeNr);

    const varEinheit = einhElem ? einhElem.textContent : '-';
    const varBez = bezElem ? bezElem.textContent : 'Unbekannter Artikel';
    const varGr = grElem ? grElem.textContent : '-';

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

    eintrNeueZeile.appendChild(eintrDel);
    eintrNeueZeile.appendChild(eintrArtNr);
    eintrNeueZeile.appendChild(eintrMenge);
    eintrNeueZeile.appendChild(eintrEinh);
    eintrNeueZeile.appendChild(eintrBez);
    eintrNeueZeile.appendChild(eintrGr);

    eintraege.appendChild(eintrNeueZeile);
}

function ausDOMentfernen(aufgabeNr) {
    const eintrag = document.getElementById('X' + aufgabeNr);
    if (eintrag) eintrag.remove();
}

function allesLöschen() {
    localStorage.clear();
    const itemList = document.getElementById('eintraege');
    if (itemList) {
        itemList.innerHTML = '';
    }
    holEintraege();
}

function getArtDaten() {
    const artNrInput = document.getElementById("ArtNr");
    if (!artNrInput) return;
    
    const sucheArtNr = artNrInput.value.trim();
    const einhElem = document.getElementById("Einh" + sucheArtNr);
    const bezElem = document.getElementById("Bez" + sucheArtNr);
    const grElem = document.getElementById("Gr" + sucheArtNr);
    const bestMElem = document.getElementById('BestM' + sucheArtNr);

    if (einhElem && bezElem && grElem && bestMElem) {
        document.getElementById('ArtDatEinh').textContent = einhElem.textContent;
        document.getElementById('ArtDatBez').textContent = bezElem.textContent;
        document.getElementById('ArtDatGr').textContent = grElem.textContent;
        
        const mengeInput = document.getElementById('Menge');
        if (mengeInput) mengeInput.value = bestMElem.textContent;
    }
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
    allesLöschen();
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

function beep() {
    // Die Audio-Daten für den Beep-Sound finden sich in den ursprünglichen Web-Dokumenten.
    const snd = new Audio("data:audio/wav;base64,...");
    snd.play().catch(e => console.log("Audio-Play blockiert, erfordert vorherige Nutzerinteraktion."));
}
