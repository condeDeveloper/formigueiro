#!/usr/bin/env node

/**
 * Procura nomes declarados em mais de um arquivo.
 *
 * Esta ferramenta existe por causa de um dia inteiro perdido.
 *
 * Os arquivos deste projeto são carregados como scripts clássicos — sem
 * `type="module"`, sem `import`, sem etapa de build. É a escolha certa para uma
 * página que tem de abrir com um duplo clique, e ela tem um custo que ninguém
 * avisa: **todos compartilham o mesmo escopo global**. Dois arquivos com
 * `const CORPO = 2` em cada um não dão dois valores; dão um `SyntaxError` que
 * mata o arquivo inteiro.
 *
 * E o erro aparece no lugar errado. O navegador reclama de redeclaração, para
 * de executar o segundo arquivo, e o sintoma que a pessoa vê é uma função
 * definida num **terceiro** arquivo dizendo que não existe. Em outro projeto eu
 * procurei o defeito no lugar errado por horas.
 *
 * Trinta linhas de leitura de texto resolvem para sempre. Roda no CI.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** `const X`, `let X`, `class X`, `function X` no começo de uma linha. */
const DECLARACAO = /^(?:const|let|var|class|function|async function)\s+([A-Za-z_$][\w$]*)/;

function arquivosDeScript(pasta) {
  const achados = [];

  for (const nome of fs.readdirSync(pasta)) {
    const caminho = path.join(pasta, nome);

    if (fs.statSync(caminho).isDirectory()) {
      achados.push(...arquivosDeScript(caminho));
    } else if (nome.endsWith('.js')) {
      achados.push(caminho);
    }
  }

  return achados;
}

function declaracoesDe(caminho) {
  const nomes = new Set();

  for (const linha of fs.readFileSync(caminho, 'utf8').split('\n')) {
    // Só o topo do arquivo importa: uma declaração recuada está dentro de uma
    // função ou de uma classe, e aí não vaza para o escopo global.
    if (/^\s/.test(linha)) {
      continue;
    }

    const achado = DECLARACAO.exec(linha);

    if (achado) {
      nomes.add(achado[1]);
    }
  }

  return nomes;
}

function principal() {
  const arquivos = arquivosDeScript(path.join(RAIZ, 'js'));

  const onde = new Map();

  for (const arquivo of arquivos) {
    for (const nome of declaracoesDe(arquivo)) {
      if (!onde.has(nome)) {
        onde.set(nome, []);
      }

      onde.get(nome).push(path.relative(RAIZ, arquivo).replace(/\\/g, '/'));
    }
  }

  const colisoes = [...onde.entries()].filter(([, arqs]) => arqs.length > 1);

  console.log(`${arquivos.length} arquivo(s), ${onde.size} nome(s) no escopo global`);

  if (colisoes.length === 0) {
    console.log('nenhuma colisão: todo nome global é declarado num arquivo só.');

    return 0;
  }

  console.log();

  for (const [nome, arqs] of colisoes) {
    console.error(`COLISÃO  ${nome}  em ${arqs.join(', ')}`);
  }

  console.error();
  console.error('Dois scripts clássicos declarando o mesmo nome dão SyntaxError,');
  console.error('e o sintoma aparece num terceiro arquivo.');

  return 1;
}

process.exitCode = principal();
