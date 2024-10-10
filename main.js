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
    })
    

    //Scanergebnis eintragen und gefundenen Artikel anzeigen
    beep();
    ArtNr.value = value.rawValue;
		SucheArtNr = value.rawValue;
		varEinheit = document.getElementById("Einh"+SucheArtNr).textContent;
		varBez = document.getElementById("Bez"+SucheArtNr).textContent;
		varGr = document.getElementById("Gr"+SucheArtNr).textContent;
    varBestM = document.getElementById("BestM"+SucheArtNr).textContent;
    varAusl = document.getElementById("Ausl"+SucheArtNr).textContent;
		ArtDatEinh.textContent = varEinheit;
		ArtDatBez.textContent = varBez;
		ArtDatGr.textContent = varGr;
    document.getElementById('Menge').value = varBestM;
    if (varAusl = '1'){
      document.getElementById('idAuslauf').style.display = 'block'
    } else {
      document.getElementById('idAuslauf').style.display = 'none'
    }   
    clearInterval(myInterval);
    video.pause();
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
      facingMode: {
        exact: "environment"
      }, width: 480, height: 480
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

