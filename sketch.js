let dati;
let maxKg = 0; // il paese che beve più caffè (serve per proporzionare la grandezza delle tazze)

// 4 bevande per le percentuali: nomi delle colonne nel csv, nomi da scrivere e colori
// l'ordine è dal basso verso l'alto della tazza, dal più scuro al più chiaro
let bevande = ["espresso", "americano", "cappuccino", "latte"];
let nomiBevande = ["Espresso", "Americano / filtro", "Cappuccino", "Caffellatte"];
let coloriBevande = ["#3B2116", "#7A4E33", "#B98A5E", "#E6CFAF"];

async function setup() {
  createCanvas(windowWidth, windowHeight);
  // se sul computer non c'è futura usa un altro font senza grazie
  textFont("Futura, sans-serif");

  dati = await loadTable("assets/caffe.csv", ",", "header"); // carico il dataset

  // cerco il valore più alto di kg a persona
  for (let riga = 0; riga < dati.getRowCount(); riga++) {
    let kg = dati.getNum(riga, "kg_procapite");
    if (kg > maxKg) {
      maxKg = kg;
    }
  }
}

function draw() {
  background("#EFE4D6");
  drawTitolo();

  // la griglia è di 5 tazze per fila, con 3 file
  // tolgo 320 px a destra per metterci la legenda, 150 px in alto per il titolo
  let colonne = 5;
  let file = 3;
  let larghezzaCella = (width - 320) / colonne;
  // qui tolgo anche 50 pixel in basso per non farlo uscire troppo in basso
  let altezzaCella = (height - 150 - 50) / file;

  // larghezza della tazza più grande che deve stare nella cella ed essere max 120 px
  let larghezzaMax = min(larghezzaCella * 0.55, altezzaCella * 0.5, 120);

  //disegno le mensole, una per fila
  for (let fila = 0; fila < file; fila++) {
    let yMensola = 150 + (fila + 1) * altezzaCella - 60;
    drawMensola(yMensola);
  }

  let paeseHover = -1; // il paese su cui si trova il mouse (-1 = nessuno)

  for (let riga = 0; riga < dati.getRowCount(); riga++) {
    // posizione nella griglia
    let colonna = riga % colonne; // da 0 a 4
    let fila = floor(riga / colonne); // 0, 1 o 2
    let x = colonna * larghezzaCella + larghezzaCella / 2;
    let yMensola = 150 + (fila + 1) * altezzaCella - 60;

    // grandezza: uso la radice quadrata così l'AREA della tazza è proporzionale ai kg
    let kg = dati.getNum(riga, "kg_procapite");
    let w = map(sqrt(kg), 0, sqrt(maxKg), 0, larghezzaMax);

    // leggo le 4 percentuali di questo paese e le metto in un array
    let percentuali = [];
    for (let i = 0; i < bevande.length; i++) {
      percentuali.push(dati.getNum(riga, bevande[i]));
    }

    // il mouse è sopra la tazza (rettangolo intorno a tazza e piattino)?
    let sopra = false;
    if (
      mouseX > x - w * 0.75 &&
      mouseX < x + w * 0.75 &&
      mouseY > yMensola - w * 1.1 &&
      mouseY < yMensola
    ) {
      sopra = true;
      paeseHover = riga;
    }

    drawTazza(x, yMensola, w, percentuali, sopra);

    // nome del paese e kg scritti sotto la mensola
    noStroke();
    textAlign(CENTER, TOP);
    fill("#3B2116");
    textSize(20);
    text(dati.getString(riga, "paese"), x, yMensola + 16);
  }

  drawLegenda(larghezzaMax);

  // riquadro hover disegnato per ultimo, così sta sopra a tutto
  if (paeseHover != -1) {
    drawRiquadro(paeseHover);
  }
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

function drawMensola(y) {
  noStroke();
  fill("#8A5A3B");
  rect(20, y, width - 350, 8, 4);
  fill("#6E4630");
  rect(30, y + 8, width - 370, 4);
}

//x = centro della tazza, yMensola = dove appoggia il piattino
//w = larghezza della tazza, percentuali = le 4 bevande, evidenziata = mouse sopra
function drawTazza(x, yMensola, w, percentuali, evidenziata) {
  let h = w * 0.9; // altezza della tazza
  let yBase = yMensola - w * 0.12; // fondo della tazza (appoggiato sul piattino)
  let margine = w * 0.08; // spessore del bordo bianco della tazza

  push();

  // disegno piattino 
  fill("#D9C9B6");
  noStroke();
  ellipse(x, yMensola - w * 0.08, w * 1.5, w * 0.16);
  fill("#FFFFFF");
  stroke("#C9B49C");
  strokeWeight(1);
  ellipse(x, yMensola - w * 0.11, w * 1.4, w * 0.14);

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
  stroke("#9C8470");
  strokeWeight(2);
  // 3 linee a forma di S: ognuna è fatta da due mezzi archi
  for (let i = -1; i <= 1; i++) {
    let xVapore = x + i * 12;
    arc(xVapore, yTop - 12, 8, 12, -HALF_PI, HALF_PI);
    arc(xVapore, yTop - 24, 8, 12, HALF_PI, PI + HALF_PI);
  }
}

function drawLegenda(larghezzaMax) {
  let x = width - 290;
  let y = 150;

  // cartoncino legenda laterale
  noStroke();
  fill("#FBF7F0");
  rect(x, y, 260, 505, 12);

  textAlign(LEFT, TOP);
  fill("#3B2116");
  textSize(22);
  text("Legenda", x + 20, y + 20);

  //grandezza
  textSize(14);
  text("Ogni tazza rappresenta un paese.", x + 20, y + 60);
  text("Più è grande, più caffè si beve (kg per persona in un anno).", x + 20, y + 82, 220);

  // tazze nella legenda per far capire le proporzioni basate su AREA
  let w2 = map(sqrt(2), 0, sqrt(maxKg), 0, larghezzaMax);
  let w6 = map(sqrt(6), 0, sqrt(maxKg), 0, larghezzaMax);
  let esempio = [20, 40, 20, 20];
  drawTazza(x + 58, y + 230, w2, esempio, false);
  drawTazza(x + 175, y + 230, w6, esempio, false);
  noStroke();
  fill("#8C735E");
  textSize(12);
  textAlign(CENTER, TOP);
  text("2 kg", x + 58, y + 240);
  text("6 kg", x + 175, y + 240);

  // strati elencati dall'alto verso il basso, come si vedono nella tazza
  textAlign(LEFT, TOP);
  fill("#3B2116");
  textSize(14);
  text("Ogni strato è una bevanda:", x + 20, y + 275);
  let yRiga = y + 302;
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
    x + 20,
    y + 405,
    220
  );

  fill("#A8927E");
  textSize(10);
  text("Kg di caffè a persona: Euromonitor 2013.", x + 20, y + 525, 220);
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

// ridimensionare tutto in base alle dimensioni della finestra
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}