'use strict';

/**
 * Uma formiga, desenhada com tres elipses e seis riscos.
 *
 * Nao ha imagem nenhuma neste projeto, e isso e proposito e nao teimosia: uma
 * formiga de tres pixels desenhada com curvas fica nitida em qualquer densidade
 * de tela, e um sprite de 8 por 8 nao fica. Alem disso, desenhar permite virar a
 * formiga no angulo em que ela esta -- com sprite seria preciso um por angulo,
 * ou uma rotacao que borra.
 *
 * As pernas balancam com a distancia percorrida, e nao com o tempo. E a
 * diferenca entre uma formiga que anda e uma que patina: quando ela para, as
 * pernas param junto.
 */

const CORPO = 2.0;

function desenharFormigas(tela, formigas, cores) {
  const pincel = tela.pincel;

  for (const formiga of formigas) {
    desenharUma(pincel, formiga, cores);
  }
}

function desenharUma(pincel, formiga, cores) {
  pincel.save();
  pincel.translate(formiga.x, formiga.y);
  pincel.rotate(formiga.angulo);

  const balanco = Math.sin(formiga.andou * 0.55);

  pincel.strokeStyle = 'rgba(20, 14, 10, 0.85)';
  pincel.lineWidth = 0.9;
  pincel.lineCap = 'round';

  for (const lado of [-1, 1]) {
    for (let par = 0; par < 3; par += 1) {
      const dePerna = (par - 1) * CORPO * 0.9;
      const abertura = (0.8 + balanco * lado * (par === 1 ? -0.35 : 0.35));

      pincel.beginPath();
      pincel.moveTo(dePerna, 0);
      pincel.lineTo(dePerna + abertura * CORPO, lado * CORPO * 1.7);
      pincel.stroke();
    }
  }

  pincel.fillStyle = formiga.carregando
    ? cores.CORES.formigaCarregada
    : cores.CORES.formiga;

  // Abdomen, torax, cabeca -- de tras para a frente.
  elipse(pincel, -CORPO * 1.5, 0, CORPO * 1.15, CORPO * 0.85);
  elipse(pincel, 0, 0, CORPO * 0.75, CORPO * 0.6);
  elipse(pincel, CORPO * 1.1, 0, CORPO * 0.7, CORPO * 0.62);

  if (formiga.carregando) {
    pincel.fillStyle = cores.CORES.monte;
    pincel.beginPath();
    pincel.arc(CORPO * 2.2, 0, CORPO * 0.8, 0, Math.PI * 2);
    pincel.fill();
  }

  pincel.restore();
}

function elipse(pincel, x, y, raioX, raioY) {
  pincel.beginPath();
  pincel.ellipse(x, y, raioX, raioY, 0, 0, Math.PI * 2);
  pincel.fill();
}
