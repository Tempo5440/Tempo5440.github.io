window.onload = init;

function init() {
	var eintraegeArray = HolEinträge();
	for (var i = 0; i < eintraegeArray.length; i++) {
		var aufgabeNr = eintraegeArray[i];
		var value = JSON.parse(localStorage[aufgabeNr]);
		insDOMschreiben(aufgabeNr, value);
	}
	var button = document.getElementById('mehr');
	button.onclick = ToDoHinzufügen;
	var clearButton = document.getElementById('loeschen');
	clearButton.onclick = allesLöschen;
	var sendButton = document.getElementById('senden');
	sendButton.onclick = DatenSenden;
	var scanButton = document.getElementById('scannen');
	scanButton.onclick = ScanStarten;
	var inventButton = document.getElementById('invent');
	inventButton.onclick = weiterleitungInventur;}

function ScanStarten() {
		// Get video element 
		const video1 = document.getElementById('video');
		video1.play();
}

function weiterleitungInventur() {
  window.location.href = "tempo5440.github.io/inventur.html";
}

function HolEinträge() {
	var eintraegeArray = localStorage.getItem('eintraegeArray');
	if (!eintraegeArray) {
		eintraegeArray = [];
		localStorage.setItem('eintraegeArray', JSON.stringify(eintraegeArray));
	} else {
		eintraegeArray = JSON.parse(eintraegeArray);
	}
	return eintraegeArray;
}

function ToDoHinzufügen() {
	var eintraegeArray = HolEinträge();
	var varArtNr = document.getElementById('ArtNr')
		.value;
    var varMenge = document.getElementById('Menge')
		.value;       
	if ((varArtNr != '') && (varMenge != 0)) {
		var aufgabeNr = varArtNr
		var aufgabeText = {
			'value': varMenge
		};
		localStorage.setItem(aufgabeNr, JSON.stringify(aufgabeText));
		eintraegeArray.push(aufgabeNr);
		localStorage.setItem('eintraegeArray', JSON.stringify(eintraegeArray));
		insDOMschreiben(aufgabeNr, aufgabeText);
		document.getElementById('ArtNr')
			.value = ' ';
        document.getElementById('Menge')
			.value = ' ';       
	} else {
		//alert('Bitte geben Sie etwas ein!');
		//HinwMenge.innerHTML = 'Menge eingeben!';
	}
}

function toDoLöschen(e) {
	var aufgabeNr = e.target.id;
	var eintraegeArray = HolEinträge();
	if (eintraegeArray) {
		for (var i = 0; i < eintraegeArray.length; i++) {
			if (aufgabeNr == eintraegeArray[i]) {
				eintraegeArray.splice(i, 1);
			}
		}
		localStorage.removeItem(aufgabeNr);
		localStorage.setItem('eintraegeArray', JSON.stringify(eintraegeArray));
		ausDOMentfernen(aufgabeNr);
	}
}

function insDOMschreiben(aufgabeNr, ItemObj) {
	var eintraege = document.getElementById('eintraege');
	var eintrag = document.createElement('li');
	var eintrNeueZeile = document.createElement('tr')
	var eintrDel = document.createElement('td');
	var eintrArtNr = document.createElement('td');
	var eintrMenge = document.createElement('td');
	var eintrEinh = document.createElement('td');	
	var eintrBez = document.createElement('td');
	var eintrGr = document.createElement('td');
	var SucheArtNr = aufgabeNr;
	var varEinheit = document.getElementById('Einh'+SucheArtNr).textContent;
	var varBez = document.getElementById('Bez'+SucheArtNr).textContent;
	var varGr = document.getElementById('Gr'+SucheArtNr).textContent;
	//eintrag.setAttribute('id', aufgabeNr);
	//eintrag.innerHTML = aufgabeNr +' - ' + ItemObj.value + ' ' + varEinheit + ' ' + varBez + ' ' + varGr;
	//eintraege.appendChild(eintrag);
	//eintrag.onclick = toDoLöschen;

	eintrNeueZeile.setAttribute('id','X'+ aufgabeNr);
	eintraege.appendChild(eintrNeueZeile);

		eintrDel.innerHTML = 'X'
		eintrDel.setAttribute('id',aufgabeNr)
		eintrNeueZeile.appendChild(eintrDel);
		eintrDel.onclick = toDoLöschen;

		eintrArtNr.innerHTML = aufgabeNr;
		eintrNeueZeile.appendChild(eintrArtNr);

		eintrMenge.innerHTML = ItemObj.value;
		eintrNeueZeile.appendChild(eintrMenge);

		eintrEinh.innerHTML = varEinheit
		eintrNeueZeile.appendChild(eintrEinh);

		eintrBez.innerHTML = varBez
		eintrNeueZeile.appendChild(eintrBez);

		eintrGr.innerHTML = varGr
		eintrNeueZeile.appendChild(eintrGr);


}

function ausDOMentfernen(aufgabeNr) {
	var eintrag = document.getElementById('X'+ aufgabeNr);
	eintrag.parentNode.removeChild(eintrag);
}

function allesLöschen() {
	localStorage.clear();
	var ItemList = document.getElementById('eintraege');
	var eintraege = ItemList.childNodes;
	for (var i = eintraege.length - 1; i >= 0; i--) {
		ItemList.removeChild(eintraege[i]);
	}
	var eintraegeArray = HolEinträge();
}


function getArtDaten(){
		SucheArtNr = document.getElementById("ArtNr").value;
		varEinheit = document.getElementById("Einh"+SucheArtNr).textContent;
		varBez = document.getElementById("Bez"+SucheArtNr).textContent;
		varGr = document.getElementById("Gr"+SucheArtNr).textContent;
		varBestMenge = document.getElementById('BestM'+SucheArtNr).textContent;
		ArtDatEinh.textContent = varEinheit;
		ArtDatBez.textContent = varBez;
		ArtDatGr.textContent = varGr;
		Menge.value = varBestMenge;
	
}

function DatenSenden(){
	//<a href="mailto:office@tempo-luft.com
	//?body=Hallo%20Fritz,%0D%0A%0D%0Aich%20wollte%20nur%20sagen,%20dass%20">
    //MailSenden
	//</a>   
	// var BestList = document.getElementById("BestellListe").value
	var body='Bestellliste:' + "\n" + 'ANFANG:' + "\n";	
	var eintraegeArray = HolEinträge();
	for (var i = 0; i < eintraegeArray.length; i++) {
		var aufgabeNr = eintraegeArray[i];
		var value = JSON.parse(localStorage[aufgabeNr]);
		body+=('ArtNr:' + aufgabeNr + ';Menge:' + value.value) + 'EH'+ "\n";
	}
	var mailBetreff='Bestellliste ' + uhrzeit()
	body+='ENDE'
	//body+= BestList;
	var to='office@tempo-luft.com'
	location.href = "mailto:"+encodeURIComponent(to)+"?subject=" + encodeURIComponent(mailBetreff) + "&body=" + encodeURIComponent(body);
	
	//Daten löschen
	allesLöschen()
}


function uhrzeit() {
	var jetzt = new Date(),
		h = jetzt.getHours(),
		m = jetzt.getMinutes(),
		s = jetzt.getSeconds();
	m = fuehrendeNull(m);
	s = fuehrendeNull(s);
	var Dat = jetzt.getFullYear() + '.' + fuehrendeNull(jetzt.getMonth()) + '.' + fuehrendeNull(jetzt.getDay())
	return uhrzeit =  Dat + ' ' + h + ':' + m + ':' + s;
}


function fuehrendeNull(zahl) {
	zahl = (zahl < 10 ? '0' : '' )+ zahl;  
	return zahl;
}

function beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
    snd.play();
}