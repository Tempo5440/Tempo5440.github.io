let codes = [];
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
    
    // Select the container scanned
    //const scanned = document.querySelector('#scanned')
    //const temp = document.createElement('scaned-item')
    //const format = document.createElement('span')
    //const rawValue = document.createElement('span')

    //Scanergebnis eintragen und gefundenen Artikel anzeigen
    ArtNr.value = value.rawValue;
		SucheArtNr = value.rawValue;
		varEinheit = document.getElementById("Einh"+SucheArtNr).textContent;
		varBez = document.getElementById("Bez"+SucheArtNr).textContent;
		varGr = document.getElementById("Gr"+SucheArtNr).textContent;
    varBestM = document.getElementById("BestM"+SucheArtNr).textContent;
		ArtDatEinh.textContent = varEinheit;
		ArtDatBez.textContent = varBez;
		ArtDatGr.textContent = varGr;
    document.getElementById('Menge').value = varBestM;
    
    // Goes into the custom elements formate slot
    format.setAttribute('slot', 'format');
    format.innerHTML = value.format;
    
    // Goes into the custom elements raw slot 
    rawValue.setAttribute('slot', 'raw');
    rawValue.innerHTML = value.rawValue;

    // Append elements to custom element
    temp.appendChild(rawValue);
    temp.appendChild(format);

    // Append Custom element to scanned container
    scanned.appendChild(temp);
    return true;
  }
});

// Get video element 
const video = document.getElementById('video');

//constraintsObject.facingMode = constraint;

// Check for a camera
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  const constraints = {
    video: true,
    video: {
      facingMode: {
        exact: "environment"
      }, width: 1920, height: 1080
    },
    audio: false
  };
  

  // Start video stream
  navigator.mediaDevices.getUserMedia(constraints).then(stream => video.srcObject = stream);
}

// Draw outline to canvas 
/* --NOTE-- 
  Some codes will not out line the whole barcode 
  instead may have a thin line this is because for a lot of 
  barcodes that is all that is needed.
  if you would like to out line the whole code you can have 
  a look at using the boundingBox object instead of 
  the cornerPoints array in this example it is not used 
  but my edit this to make a square around other codes
  that do not get outlined :) 
*/
const drawCodePath = ({cornerPoints}) => {
  const canvas = document.querySelector('#canvas');
  const ctx = canvas.getContext('2d');
  const strokeGradient = ctx.createLinearGradient(0, 0, canvas.scrollWidth, canvas.scrollHeight);
  
  // Exit function and clear canvas if no corner points
  if (!cornerPoints) return ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Clear canvas for new redraw
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Create new gradient
  strokeGradient.addColorStop('0', '#ffffff');
  strokeGradient.addColorStop('1', '#ff0000');

  // Define stoke styles
  ctx.strokeStyle = strokeGradient;
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
      drawCodePath(barcode);
      
      // Code in seen set then exit loop 
      //if (seen.has(barcode.rawValue)) return;

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
setInterval(detectCode, 100);

