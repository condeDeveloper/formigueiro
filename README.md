# formigueiro

Uma colônia de formigas em JavaScript puro — sem framework, sem etapa de build,
sem dependência e sem um único arquivo de imagem.

**[Ver rodando →](https://condedeveloper.github.io/formigueiro/)**

Nenhuma formiga sabe onde fica a comida. Nenhuma lembra do caminho de volta.
Nenhuma fala com outra. Cada uma cheira três pontos à frente e escolhe um. A
trilha que aparece na tela não está no código de ninguém — ela é feita **de
chão**.

## As cinco regras, e é só isso

1. Se eu **vejo** o que procuro, vou direto nele.
2. Se há cheiro à frente, escolho entre os três pontos com chance proporcional
   ao cheiro.
3. Se não há cheiro nenhum, sigo em frente com um tremor.
4. Se bati na parede, viro.
5. Em **3%** dos passos, ignoro tudo isso e vou para qualquer lado.

A quinta é a que parece errada e é a essencial. Sem ela, a colônia acha a
primeira trilha e nunca mais sai dela: a trilha se reforça sozinha e nenhum
atalho tem quem o descubra. Com 3% de acaso, umas poucas formigas se desgarram o
tempo todo, e são elas que acham o caminho curto — que então vence sozinho,
porque é curto e o cheiro nele evapora menos antes da próxima passar.

O canal de comunicação é o chão, e só ele. Uma formiga muda o ambiente; outra,
minutos depois, lê a mudança. Isso tem nome desde 1959: **estigmergia**, de
Pierre-Paul Grassé, que estudava cupins e precisava explicar como eles constroem
juntos uma coisa que nenhum deles conhece.

## O juiz

Uma simulação visual tem um problema de honestidade: ela sempre *parece*
funcionar. As formigas andam, o rastro aparece, alguma coisa acontece na tela, e
a impressão de que o algoritmo está certo vem de graça.

Foi exatamente assim que a primeira versão daqui passou. Com **um campo de
feromônio só**, as formigas faziam um círculo lindo em volta do ninho e não
entregavam comida nenhuma. Na tela, parecia perfeito.

Então o juiz aqui é a geometria, que não depende de opinião: a distância em
linha reta entre o ninho e a comida. E há um segundo juiz, que é a mesma colônia
com o feromônio **desligado** — se as formigas com trilha não acharem muito mais
comida que as formigas cegas, o mecanismo não está fazendo nada.

```
$ npm run medir

                        com trilha    sem trilha
----------------------------------------------------
comida entregue             659            22
caminho por volta          2028          5713  pixels

a linha reta ninho -> monte mais perto:  439 pixels
o minimo possivel para a volta inteira:  758 pixels

a trilha entrega 30.6x mais comida que o acaso
e a volta media custa 2.67x o minimo geometrico
```

**30 vezes** mais comida, e a volta converge para **2,7×** o mínimo geométrico.
São números que dá para conferir, e não uma impressão.

E ele já me pegou uma vez: a primeira medida dizia `0,95x o mínimo` — uma volta
*menor* que o mínimo possível, o que é impossível. Eu estava medindo só a perna
de volta e comparando com a ida e volta inteira.

## Como as constantes foram escolhidas

Mexer no número, olhar a tela, achar que melhorou e seguir não vale nada numa
simulação em que tudo é probabilístico: duas rodadas da mesma versão já parecem
diferentes. Toda constante daqui passou por uma varredura:

```
$ node ferramentas/afinar.mjs acaso

   valor   entregues   volta/minimo
----------------------------------------------------
       0         135           3.59  #####
    0.01         126           3.82  #####
    0.03         166           3.86  #######  <- o que esta no codigo
    0.08         114           4.16  #####
     0.2         127           4.01  #####
     0.5          41           3.83  ##
```

Há quatro varreduras: `acaso`, `expoente`, `evaporacao` e `formigas`. E a
própria ferramenta já mentiu uma vez — a primeira versão montava a escolha nova
e o passo continuava chamando a de sempre, então a varredura rodava, imprimia
números bonitos e media a mesma coisa seis vezes. Um juiz com defeito não acusa
nada; ele só concorda com o que você fez.

## As três decisões que fazem a coisa funcionar

**São dois cheiros, não um.** Verde para "tem comida por aqui", violeta para
"por aqui se volta". Com um campo só, a trilha vira um círculo em que as
formigas andam para sempre sem chegar a lugar nenhum.

**Cada formiga deposita o cheiro do caminho que acabou de fazer**, não o do que
quer seguir. Quem volta carregando comida marca "comida", porque veio de lá. A
informação anda ao contrário das formigas, e é isso que faz a trilha apontar
para os dois lados ao mesmo tempo.

**O depósito míngua.** Uma formiga que deposita com a mesma força o tempo todo
marca também o trecho em que estava perdida, e a trilha herda a volta inteira.
Com o depósito enfraquecendo conforme ela se afasta do destino, um caminho curto
chega com mais cheiro sobrando que um longo — e é assim que a trilha encurta
sozinha.

E a evaporação não é detalhe de realismo: é o único mecanismo de **esquecimento**
que o sistema tem. Sem ela, a primeira trilha achada — por pior que seja — fica
marcada para sempre.

## A comida acaba

São dois montes, um perto e um longe, e os dois esgotam. Uma fonte infinita dá
uma trilha que se estabiliza e fica igual para sempre, o que é bonito e não
ensina nada. Com a fonte acabando, a colônia tem de **largar** a trilha boa e
achar outra — e ver isso acontecer, com a trilha velha evaporando enquanto a
nova se forma, é a coisa mais interessante que este projeto mostra.

## Sobre o código

**Nenhuma imagem, nenhum som.** Uma formiga são três elipses e seis riscos, e as
pernas balançam com a distância percorrida — não com o tempo. É a diferença
entre uma formiga que anda e uma que patina: quando ela para, as pernas param
junto.

**Dois relógios de propósito.** O desenho acontece quando o navegador deixa; a
simulação anda em passo fixo de 1/30 s, com acumulador. Com passo variável, uma
colônia num computador rápido avança diferente da mesma colônia num lento — e aí
a medida de uma máquina deixa de valer na outra, o que destrói a única coisa
sólida que este projeto tem.

**Sorteio com semente, e não `Math.random`.** A mesma semente dá exatamente a
mesma simulação. É o que permite a ferramenta rodar dez sementes e comparar
médias, em vez de olhar uma rodada e torcer.

**14 mil células de feromônio por quadro**, desenhadas num `ImageData` do
tamanho da grade — 160 por 90 — que o navegador estica. Com 14 mil `fillRect` a
página rodava a 12 quadros por segundo; assim roda a 60, e o esticamento ainda
suaviza as bordas e faz a trilha parecer um campo contínuo.

## Uma ferramenta que existe por causa de um dia perdido

```
$ node ferramentas/conferir-colisoes.mjs
15 arquivo(s), 51 nome(s) no escopo global
nenhuma colisão: todo nome global é declarado num arquivo só.
```

Os arquivos são scripts clássicos — sem `import`, sem build, para a página abrir
com um duplo clique. O custo que ninguém avisa: **todos compartilham o mesmo
escopo global**, e dois arquivos com `const CORPO` em cada um dão um
`SyntaxError` que mata o arquivo inteiro.

E o erro aparece no lugar errado: o navegador para de executar o segundo
arquivo, e o sintoma é uma função definida num **terceiro** arquivo dizendo que
não existe. Trinta linhas de leitura de texto resolvem para sempre. Roda no CI.

## Rodar

Abra o `index.html`. É só isso — não há build, não há servidor, não há
`npm install`.

Para as ferramentas, Node 18 ou mais novo:

```
npm run medir                              # o juiz
node ferramentas/afinar.mjs expoente       # varre um parâmetro
node ferramentas/conferir-colisoes.mjs     # nomes globais repetidos
```

## Por dentro

| arquivo | o que faz |
|---|---|
| `js/aleatorio.js` | o sorteio com semente, e a escolha por peso |
| `js/mundo/grade.js` | o mundo em células de 8 pixels |
| `js/mundo/feromonio.js` | os dois campos, e a evaporação exponencial |
| `js/mundo/cenario.js` | ninho, montes que acabam, paredes |
| `js/formiga/sentidos.js` | os três pontos à frente, e mais nada |
| `js/formiga/formiga.js` | cinco números e um booleano |
| `js/formiga/decisao.js` | as cinco regras |
| `js/formiga/colonia.js` | o passo de tempo, sem saber o que é um canvas |
| `js/relogio.js` | passo fixo, quadro livre, e a espiral da morte |
| `js/desenho/*` | canvas em alta densidade, o campo em `ImageData`, a formiga |
| `ferramentas/medir.mjs` | o juiz |
| `ferramentas/afinar.mjs` | as varreduras |

## O que ele não faz

Não tem formigas soldado, nem rainha, nem ninho que cresce. Não tem obstáculos
que se movem nem chuva que lava a trilha. Não usa WebGL — 220 formigas e 14 mil
células cabem no canvas 2D, e uma dependência a mais custaria mais do que
resolve.

## Licença

MIT.
