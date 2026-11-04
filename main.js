let codes = [];
var intZeitIntervall = 100;
const seen = new Set();

// Create new barcode detector
const barcodeDetector = new barcodeDetector({ formats: ['code_39'] });

// Codes proxy/state
const codesProxy = new Proxy(codes, {
  set (target, prop, value, receiver) {
    if (typeof value === 'number') throw value;
    
    target.push(value);

    // Check if code has already been scanned
    target = target.filter((c) => {
      if (c.rawValue !== window.barcodeVal) return c;
      const d = seen.has(c.rawValue);
      seen.add(c.rawValue);
      return !d;
    });
    
    // Scanergebnis verarbeiten
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
    video: {
      facingMode: {
        exact: "environment"
      }, width: 480, height: 480
    },
    audio: false
  };
  
  // Start video stream
  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => { if (video) video.srcObject = stream; })
    .catch(err => console.error("Kamera-Zugriff verweigert oder nicht vorhanden:", err));
}

// Barcode-Ränder zeichnen 
const drawCodePath = ({cornerPoints}) => {
  const canvas = document.querySelector('#canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  if (!cornerPoints) return ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 4;
  ctx.beginPath();

  for (const [i, {x, y}] of cornerPoints.entries()) {
    if (i === 0) {
      ctx.moveTo(x - ctx.lineWidth/2, y);
      continue;
    }
    ctx.lineTo(x, y);
    if (i === cornerPoints.length-1) ctx.lineTo(cornerPoints[0].x, cornerPoints[0].y);
  }
  ctx.stroke();
};

// Detect code function 
const detectCode = () => {
  if (!video || video.paused || video.ended) return; // Verhindert Fehler, wenn Video pausiert ist
  barcodeDetector.detect(video).then(codes => {
    if (codes.length === 0) return drawCodePath({});
    
    for (const barcode of codes)  {
      console.log(barcode);
      if (seen.has(barcode.rawValue)) return;

      window.barcodeVal = barcode.rawValue;
      codesProxy.push(barcode);
    }
  }).catch(err => {
    console.error(err);
  });
};

// Run detect code function every 100 milliseconds
const myInterval = setInterval(detectCode, 100);

function beep() {
    // Die Audio-Daten für den Beep-Sound finden sich in den ursprünglichen Web-Dokumenten.
    const snd = new Audio("data:audio/wav;base64,...");
    snd.play().catch(e => console.log("Audio-Play blockiert, erfordert vorherige Nutzerinteraktion."));
}

