'use strict';

/**
 * Desenha o chao: o feromonio, o ninho, os montes e as paredes.
 *
 * O feromonio e a parte cara. Sao 14 mil celulas por quadro, e desenhar 14 mil
 * retangulos com `fillRect` derruba o navegador -- foi assim na primeira
 * versao, a 12 quadros por segundo.
 *
 * A saida e escrever direto nos bytes de um `ImageData` do tamanho da GRADE, e
 * nao da tela: 160 por 90 pixels, um por celula. O navegador estica de uma vez
 * so, e de quebra o esticamento suaviza as bordas e faz a trilha parecer um
 * campo continuo em vez de um mosaico. Custa uma copia e sai a 60 quadros.
 */

function desenharFeromonio(tela, feromonio, cores, teto) {
  const grade = feromonio.grade;

  if (!tela.imagemDoCheiro) {
    tela.imagemDoCheiro = tela.pincel.createImageData(grade.colunas, grade.linhas);
    tela.telaDoCheiro = document.createElement('canvas');
    tela.telaDoCheiro.width = grade.colunas;
    tela.telaDoCheiro.height = grade.linhas;
    tela.pincelDoCheiro = tela.telaDoCheiro.getContext('2d');
  }

  const imagem = tela.imagemDoCheiro;
  const bytes = imagem.data;

  for (let i = 0; i < grade.quantas; i += 1) {
    const cor = cores.misturar(feromonio.deComida[i], feromonio.deCasa[i], teto);
    const onde = i * 4;

    bytes[onde] = cor.r;
    bytes[onde + 1] = cor.g;
    bytes[onde + 2] = cor.b;
    bytes[onde + 3] = cor.alfa * 255;
  }

  tela.pincelDoCheiro.putImageData(imagem, 0, 0);

  tela.pincel.imageSmoothingEnabled = true;
  tela.pincel.drawImage(tela.telaDoCheiro, 0, 0, tela.largura, tela.altura);
}

function desenharCenario(tela, cenario, cores) {
  const pincel = tela.pincel;

  for (const parede of cenario.paredes) {
    pincel.fillStyle = cores.CORES.parede;
    pincel.fillRect(parede.x, parede.y, parede.largura, parede.altura);

    pincel.fillStyle = cores.CORES.paredeTopo;
    pincel.fillRect(parede.x, parede.y, parede.largura, 3);
  }

  for (const monte of cenario.montes) {
    desenharMonte(pincel, monte, cores);
  }

  desenharNinho(pincel, cenario.ninho, cores);
}

/**
 * O monte de comida, como um punhado de graos.
 *
 * Os graos somem conforme a comida acaba, e a posicao de cada um sai de uma
 * conta fixa a partir do indice -- nao de um sorteio. Com sorteio, os graos
 * pulam de lugar a cada quadro e o monte pisca.
 */
function desenharMonte(pincel, monte, cores) {
  const quantos = Math.ceil(monte.fracao * 26);

  pincel.fillStyle = cores.CORES.monteVazio;
  pincel.beginPath();
  pincel.arc(monte.x, monte.y, monte.raio, 0, Math.PI * 2);
  pincel.fill();

  pincel.fillStyle = cores.CORES.monte;

  for (let i = 0; i < quantos; i += 1) {
    // Espiral de Fermat: os pontos ficam espalhados de um jeito parelho, sem
    // aglomerar no centro nem fazer raios.
    const angulo = i * 2.39996;
    const raio = monte.raio * 0.86 * Math.sqrt(i / 26);

    pincel.beginPath();
    pincel.arc(
      monte.x + Math.cos(angulo) * raio,
      monte.y + Math.sin(angulo) * raio,
      3.1, 0, Math.PI * 2);
    pincel.fill();
  }
}

function desenharNinho(pincel, ninho, cores) {
  const gradiente = pincel.createRadialGradient(
    ninho.x, ninho.y, 2, ninho.x, ninho.y, ninho.raio);

  gradiente.addColorStop(0, '#120C08');
  gradiente.addColorStop(0.55, cores.CORES.ninho);
  gradiente.addColorStop(1, cores.CORES.ninhoBorda);

  pincel.fillStyle = gradiente;
  pincel.beginPath();
  pincel.arc(ninho.x, ninho.y, ninho.raio, 0, Math.PI * 2);
  pincel.fill();
}
