let dati;
let maxKg = 0; // il paese che beve più caffè (serve per proporzionare la grandezza delle tazze)

// l'ordine è dal basso verso l'alto della tazza, dal più scuro al più chiaro
//nomi delle bevande nel dataset
let bevande = ["espresso", "americano", "cappuccino", "latte"];
// nomi delle bevande nel grafico
let nomiBevande = ["Espresso", "Americano / filtro", "Cappuccino", "Caffellatte"];
let coloriBevande = ["#3B2116", "#7A4E33", "#B98A5E", "#E6CFAF"];

// assi del grafico disegnato sul vassoio
let asseXmin = 1; // asse x: kg di caffè a persona, valore minimo 1
let asseXmax = 10; // valore massimo 10 (nessun paese beve meno di 1 kg)
let asseYmin = 10; // asse y: % di bevande con il latte, da 10% 
let asseYmax = 70; // max bevande con latte al 70%
 
// bordi dell'area del grafico e tazza più grande
let sinistra, destra, alto, basso;
let larghezzaMax = 75;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  // se sul computer non c'è futura usa un altro font senza grazie
  textFont("Futura, sans-serif");

  dati = await loadTable("assets/caffe.csv", ",", "header"); // carico il dataset

  // cerco il valore più alto di kg a persona
  for (let riga = 0; riga < dati.getRowCount(); riga++) {
    // prendo il valore dalla tabella
    let kg = dati.getNum(riga, "kg_procapite");
    if (kg > maxKg) {
      maxKg = kg;
    }
  }
}

function draw() {
  background("#EFE4D6");
  drawTitolo();

  // il vassoio occupa tutto lo spazio a sinistra della legenda
  let xVassoio = 70;
  let yVassoio = 150;
  let larghezzaVassoio = width - 350 - xVassoio; // finisce 350 px prima del bordo destro
  let altezzaVassoio = height - yVassoio - 50; // 50 px liberi in basso
  drawVassoio(xVassoio, yVassoio, larghezzaVassoio, altezzaVassoio);
 
  // area del grafico dentro il vassoio: lascio spazio sopra per le tazze e ai lati per le scritte
  sinistra = xVassoio + 80;
  destra = xVassoio + larghezzaVassoio - 60;
  alto = yVassoio + 140;
  basso = yVassoio + altezzaVassoio - 70;
  drawAssi(xVassoio, yVassoio, altezzaVassoio);

  /* primo ciclo, cerca la tazza su cui è il mouse.
  se due tazze si sovrappongono prende quella messa "davanti" */

  let paeseHover = -1; // il paese su cui si trova il mouse (-1 = nessuno perché le righe iniziano da 0)

  for (let riga = 0; riga < dati.getRowCount(); riga++) {
    let x = posizioneX(riga);
    let y = posizioneY(riga);
    let w = larghezzaTazza(dati.getNum(riga, "kg_procapite"));
    // rettangolo intorno a tazza e piattino
    if (mouseX > x - w * 0.75 && mouseX < x + w * 0.75 && mouseY > y - w * 1.1 && mouseY < y) {
      paeseHover = riga;
    }
  }
 
  /* SECONDO CICLO: disegno le tazze.
  Nel csv i paesi sono ordinati dal più "lattoso" al meno, così prima disegno
  le tazze in alto (in fondo al vassoio) e poi quelle in basso, che stanno davanti */
  for (let riga = 0; riga < dati.getRowCount(); riga++) {
    let x = posizioneX(riga);
    let y = posizioneY(riga);
    let w = larghezzaTazza(dati.getNum(riga, "kg_procapite"));
 
    // leggo le 4 percentuali di questo paese e le metto in un array
    let percentuali = [];
    for (let i = 0; i < bevande.length; i++) {
      percentuali.push(dati.getNum(riga, bevande[i]));
    }
 
    drawTazza(x, y, w, percentuali, riga == paeseHover);
 
    // nome del paese sotto il piattino
    noStroke();
    textAlign(CENTER, TOP);
    fill("#F1DCC0");
    textSize(12);
    text(dati.getString(riga, "paese"), x, y + 5);
  }
 
  drawLegenda();

  /* riquadro hover disegnato per ultimo, così sta sopra a tutto.
  RICORDATI CHE != STA PER "DIVERSO DA" quindi se il valore di paeseHover
  è diverso da -1, che è il valore assegnato inizialmente (dato che le righe
  iniziano da 0) e quindi significa che non sto passando con il mouse sopra
  ad un paese, disegno il riquadro con i dettagli e le percentuali */
  if (paeseHover != -1) {
    drawRiquadro(paeseHover);
  }
}

// x della tazza = kg di caffè a persona
function posizioneX(riga) {
  let kg = dati.getNum(riga, "kg_procapite");
  return map(kg, asseXmin, asseXmax, sinistra, destra);
}
 
// y della tazza = % di bevande con il latte (cappuccino + caffellatte)
// è il punto dove appoggia il piattino
function posizioneY(riga) {
  let conLatte = dati.getNum(riga, "cappuccino") + dati.getNum(riga, "latte");
  // basso e alto sono invertiti perché sullo schermo la y cresce verso il basso
  return map(conLatte, asseYmin, asseYmax, basso, alto);
}
 
// grandezza: uso la radice quadrata così l'AREA della tazza è proporzionale ai kg
function larghezzaTazza(kg) {
  return map(sqrt(kg), 0, sqrt(maxKg), 0, larghezzaMax);
}

function drawTitolo() {
  noStroke();
  textAlign(LEFT, TOP);
  fill("#3B2116");
  textSize(38);
  text("A world fueled by caffeine", 40, 35);

  fill("#7A4E33");
  textSize(18);
  text("Dove si beve più caffè nel mondo? E quali sono le bevande più popolari?", 42, 88);
}

// vassoio di legno con le maniglie ai lati
function drawVassoio(x, y, w, h) {
  noStroke();
 
  // ombra leggera sotto il vassoio
  fill(0, 0, 0, 25);
  rect(x + 8, y + 10, w, h, 30);
 
  // maniglie: un rettangolo arrotondato con un buco del colore dello sfondo
  fill("#6E4630");
  rect(x - 30, y + h / 2 - 50, 50, 100, 20);
  rect(x + w - 20, y + h / 2 - 50, 50, 100, 20);
  fill("#EFE4D6");
  rect(x - 20, y + h / 2 - 30, 14, 60, 7);
  rect(x + w + 6, y + h / 2 - 30, 14, 60, 7);
 
  // bordo del vassoio
  fill("#6E4630");
  rect(x, y, w, h, 30);
 
  // piano del vassoio, 22 px più dentro del bordo
  fill("#8A5A3B");
  rect(x + 22, y + 22, w - 44, h - 44, 18);
}
 
// griglia e numeri degli assi, incisi sul vassoio
function drawAssi(xVassoio, yVassoio, altezzaVassoio) {
  textSize(12);
  fill("#F1DCC0");
 
  // asse x: una linea verticale per ogni kg, numeri sul bordo davanti del vassoio
  for (let kg = asseXmin; kg <= asseXmax; kg++) {
    let x = map(kg, asseXmin, asseXmax, sinistra, destra);
    stroke("#9A6845");
    strokeWeight(1);
    line(x, alto - 40, x, basso);
    noStroke();
    textAlign(CENTER, CENTER);
    text(kg, x, yVassoio + altezzaVassoio - 11); // al centro del bordo (alto 22 px)
  }
 
  // asse y: una linea orizzontale ogni 10%, numeri a sinistra
  for (let p = asseYmin; p <= asseYmax; p = p + 10) {
    let y = map(p, asseYmin, asseYmax, basso, alto);
    stroke("#9A6845");
    strokeWeight(1);
    line(sinistra, y, destra, y);
    noStroke();
    textAlign(RIGHT, CENTER);
    text(p + "%", sinistra - 12, y);
  }
 
  // titoli degli assi
  textSize(13);
  textAlign(LEFT, TOP);
  text("↑ più latte  (% di cappuccino + caffellatte)", sinistra - 50, yVassoio + 40);
  text("↓ più caffè nero", sinistra - 50, basso + 14);
  // titolo dell'asse x: sotto il vassoio, allineato a destra
  fill("#7A4E33");
  textAlign(RIGHT, TOP);
  text("kg di caffè a persona in un anno →", destra, yVassoio + altezzaVassoio + 12);
}
 
//x = centro della tazza, yAppoggio = dove appoggia il piattino
//w = larghezza della tazza, percentuali = le 4 bevande, evidenziata = mouse sopra
function drawTazza(x, yAppoggio, w, percentuali, evidenziata) {
  let h = w * 0.9; // altezza della tazza
  let yBase = yAppoggio - w * 0.12; // fondo della tazza (appoggiato sul piattino)
  let margine = w * 0.08; // spessore del bordo bianco della tazza

  push();

  // disegno piattino 
  fill("#D9C9B6");
  noStroke();
  ellipse(x, yAppoggio - w * 0.08, w * 1.5, w * 0.16);
  fill("#FFFFFF");
  stroke("#C9B49C");
  strokeWeight(1);
  ellipse(x, yAppoggio - w * 0.11, w * 1.4, w * 0.14);

  /* disegno manico fatto due volte in modo che il bordo esca anche all'interno del buco
  quindi prima lo disegno un po' più spesso in beige , poi sopra in bianco */
  noFill();
  stroke("#C9B49C");
  strokeWeight(w * 0.09 + 2);
  ellipse(x + w * 0.5, yBase - h * 0.55, w * 0.42, h * 0.45);
  stroke("#FFFFFF");
  strokeWeight(w * 0.09);
  ellipse(x + w * 0.5, yBase - h * 0.55, w * 0.42, h * 0.45);

  // corpo della tazza (angoli in basso arrotondati)
  fill("#FFFFFF");
  // se mouse sopra, il bordo è più spesso e marrone scuro
  if (evidenziata) {
    stroke("#3B2116");
    strokeWeight(2);
  } else {
    stroke("#C9B49C");
    strokeWeight(1);
  }
  rect(x - w / 2, yBase - h, w, h, 0, 0, w * 0.18, w * 0.18);

  // interno della tazza con lo stesso margine su tutti e 4 i lati
  let xInterno = x - w / 2 + margine;
  let larghezzaInterna = w - margine * 2;
  let altezzaInterna = h - margine * 2; // spazio da riempire (100%)
  let yInterno = yBase - h + margine; // bordo alto dell'interno

  // maschera per il rettangolo interno alla tazzina che ha gli angoli in basso arrotondati
  push();
  beginClip();
  rect(xInterno, yInterno, larghezzaInterna, altezzaInterna, 0, 0, w * 0.1, w * 0.1);
  endClip();

  //strati di caffè: parto dal fondo e salgo
  noStroke();
  let y = yBase - margine; //parto dal fondo
  for (let i = 0; i < percentuali.length; i++) {
    let altezzaStrato = (altezzaInterna * percentuali[i]) / 100;
    fill(coloriBevande[i]);
    rect(xInterno, y - altezzaStrato, larghezzaInterna, altezzaStrato);
    y = y - altezzaStrato; //lo strato dopo parte sopra a questo
  }
  pop(); //qui finisce la maschera

  //se c'è il mouse sopra, la tazza "fuma"
  if (evidenziata) {
    drawVapore(x, yBase - h);
  }

  pop();
}

function drawVapore(x, yTop) {
  noFill();
  stroke("#f1dcc0"); // chiaro, sotto il vassoio è scuro
  strokeWeight(2);
  /* 3 linee a forma di S: ognuna è fatta da due mezzi archi
  che stanno uno sotto all'altro*/
  for (let i = -1; i <= 1; i++) {
    let xVapore = x + i * 12;
    /* funzione arc i primi due valori sono per il centro dell'arco
    terzo e quarto sono per la larghezza e l'altezza
    quinto e sesto gli angoli tra cui l'arco è compreso (quindi in tot 180 gradi) */
    arc(xVapore, yTop - 8, 8, 8, -HALF_PI, HALF_PI);
    arc(xVapore, yTop - 16, 8, 8, HALF_PI, PI + HALF_PI);
  }
}

function drawLegenda() {
  let x = width - 290;
  let y = 150;

  // cartoncino legenda laterale
  noStroke();
  fill("#FBF7F0");
  rect(x, y, 260, 590, 12);

  textAlign(LEFT, TOP);
  fill("#3B2116");
  textSize(22);
  text("Legenda", x + 20, y + 20);

  //grandezza e posizione orizzontale
  textSize(14);
  text("Ogni tazza rappresenta un paese.", x + 20, y + 60);
  text("Più è grande, più caffè si beve (kg per persona in un anno).", x + 20, y + 82, 220);
  /* qui il quarto parametro 220 è per indicare la larghezza massima delle righe
  e far andare a capo il testo anziché farlo uscire dal rettangolo */

  // tazze nella legenda per far capire le proporzioni basate su AREA
  // tazzina per 2kg a persona
  let w2 = larghezzaTazza(2);
  // tazzina per 6kg a persona
  let w6 = larghezzaTazza(6);
  let esempio = [20, 40, 20, 20];
  drawTazza(x + 70, y + 225, w2, esempio, false);
  drawTazza(x + 170, y + 225, w6, esempio, false);
  // false serve perché altrimenti se passassi sopra il mouse cambierebbe il bordo
  noStroke();
  fill("#8C735E");
  textSize(12);
  textAlign(CENTER, TOP);
  text("2 kg", x + 70, y + 235);
  text("6 kg", x + 170, y + 235);

  // posizione verticale
  textAlign(LEFT, TOP);
  fill("#3B2116");
  textSize(14);
  text("Più è in alto, più caffè si beve con il latte (cappuccino e caffellatte).", x + 20, y + 270, 220);

  // strati elencati dall'alto verso il basso, come si vedono nella tazza
  text("Ogni strato è una bevanda:", x + 20, y + 340);
  let yRiga = y + 366;
  for (let i = bevande.length - 1; i >= 0; i--) {
    fill(coloriBevande[i]);
    rect(x + 20, yRiga, 18, 14, 3);
    fill("#3B2116");
    text(nomiBevande[i], x + 48, yRiga);
    yRiga = yRiga + 24;
  }

  fill("#7A4E33");
  text(
    "Passa il mouse su una tazza per vedere quali, fra le bevande a base di caffè, sono più diffuse in ogni paese.",
    x + 20, y + 470, 220
  );

  fill("#A8927E");
  textSize(10);
  text("Kg di caffè a persona: Euromonitor 2013.", x + 20, y + 550, 220);
}

// disegno il riquadro con i dettagli del paese su cui c'è il mouse
function drawRiquadro(riga) {
  let larghezzaBox = 230;
  let altezzaBox = 160;

  // riquadro sta in basso a destra del mouse
  let boxX = mouseX + 15;
  let boxY = mouseY + 15;
  // se il riquadro esce dalla finestra lo sposto
  if (boxX + larghezzaBox > width) {
    boxX = mouseX - larghezzaBox - 15;
  }
  if (boxY + altezzaBox > height) {
    boxY = mouseY - altezzaBox - 15;
  }

  noStroke();
  fill("#2B1A12");
  rect(boxX, boxY, larghezzaBox, altezzaBox, 8);

  textAlign(LEFT, TOP);
  fill("#FBF7F0");
  textSize(20);
  text(dati.getString(riga, "paese"), boxX + 14, boxY + 12);

  fill("#D9C2A5");
  textSize(13);
  text(dati.getNum(riga, "kg_procapite") + " kg per persona all'anno", boxX + 14, boxY + 40);

  // legenda bevande nell'ordine dall'alto verso il basso come nella tazza
  let yRiga = boxY + 68;
  for (let i = bevande.length - 1; i >= 0; i--) {
    fill(coloriBevande[i]);
    stroke("#FBF7F0"); // bordo chiaro intorno ai quadratini delle bevande
    rect(boxX + 14, yRiga, 12, 12, 2);
    noStroke();
    fill("#FBF7F0");
    text(nomiBevande[i] + ": " + dati.getNum(riga, bevande[i]) + "%", boxX + 34, yRiga - 1);
    yRiga = yRiga + 21;
  }
}

/* ridimensionare tutto in base alle dimensioni della finestra
però se troppo stretta si vanno a sovrapporre le scritte tra loro */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}