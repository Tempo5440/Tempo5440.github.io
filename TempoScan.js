window.onload = init;

function init() {
	var button = document.getElementById('mehr');
	button.onclick = ToDoHinzufügen;
	var clearButton = document.getElementById('loeschen');
	clearButton.onclick = allesLöschen;
	var sendButton = document.getElementById('senden');
	sendButton.onclick = DatenSenden;

	var eintraegeArray = HolEinträge();
	for (var i = 0; i < eintraegeArray.length; i++) {
		var aufgabeNr = eintraegeArray[i];
		var value = JSON.parse(localStorage[aufgabeNr]);
		insDOMschreiben(aufgabeNr, value);
	}
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

function DatenSenden (){
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
