import React, { Component } from "react";
import Sprite, { Rect } from "./components/Sprite";
import SpriteMapper from "./components/SpriteMapper";

import "./App.scss";

const INITIAL_PLAYER_POSITION = 331; // posicao
const INITIAL_PLAYER_LEFT = 80; // x inicial
const CHAO_POSICAO = 400; // chao posicao
const CHAO_VELOCIDADE = 15;
const FPS = 30;

const GRAVIDADE = 0.0020; // gravidade
const FORCA_PULO = 1.1; // pulo

const CACTUS_SEQUENCES = [
  "smallCactus1",
  "smallCactus2",
  "smallCactus3",
  "bigCactus1",
  "bigCactus2",
  "bigCactus3"
];

const KEYCODES = { // botoes
  DOWN: 40,
  UP: 38,
  SPACE: 32
};

const cuts = [ // cortes dos sprites, botao, dino, cactos...
  new Rect(0, 0, 75, 70),
  new Rect(75, 0, 90, 100),
  new Rect(165, 0, 95, 100),
  new Rect(260, 5, 90, 62),
  new Rect(350, 5, 90, 62),
  new Rect(440, 0, 40, 70),
  new Rect(480, 0, 68, 70),
  new Rect(548, 0, 100, 70),
  new Rect(648, 0, 55, 100),
  new Rect(703, 0, 100, 100),
  new Rect(803, 0, 150, 100),
  new Rect(953, 25, 385, 50),
  new Rect(1338, 0, 88, 100),
  new Rect(1426, 0, 88, 100),
  new Rect(1514, 0, 88, 100),
  new Rect(1602, 0, 88, 100),
  new Rect(1690, 0, 88, 100),
  new Rect(1778, 0, 88, 100),
  new Rect(1866, 40, 118, 50),
  new Rect(1984, 40, 118, 50),
  new Rect(2, 101, 99999999999, 30)//chao
];

const sequences = { // os [x] sao as posicao do array do cuts
  refreshButton: [0],
  iddle: [1],
  cloud: [2],
  flyingEnemy: [3, 3, 3, 4, 4, 4],
  smallCactus1: [5],
  smallCactus2: [6],
  smallCactus3: [7],
  bigCactus1: [8],
  bigCactus2: [9],
  bigCactus3: [10],
  gameOver: [11],
  iddle2: [12, 13],
  run: [14, 14, 14, 15, 15, 15],
  die: [16, 17],
  loweredRun: [18, 19],
  ground: [20]
};

class App extends Component {
  state = {
    dificult: 1, // começa em 1 
    play: false,
    gameOver: false,
    activeSequence: "iddle", // sequencia de parado
    position: INITIAL_PLAYER_POSITION,
    jumForce: 0,
    falling: false,
    score: 0,
    invertColor: false,
    cloud: [
      {
        speed: 5,
        x: 500,
        y: 230
      },
      {
        speed: 3,
        x: document.body.offsetWidth + 200,
        y: 310
      }
    ],
    cactus: [
      {
        sequence: "smallCactus1",
        x: 400,
        y: 355
      },
      {
        sequence: "smallCactus2",
        x: 800,
        y: 355
      },
      {
        sequence: "smallCactus3",
        x: 1200,
        y: 355
      }
    ],
    pterodactyl: {
      x: document.body.offsetWidth * (3 + Math.ceil(Math.random() * 10)), // aparece 3 telas pra frente ou 13 telas
      y: 280
    }
  };

  constructor(props) {
    super(props);
    this.setControls();
    setInterval(() => { // executa apos o tempo
      const { play, dificult, score, invertColor } = this.state;
      if (!play) return;

      this.setState({
        ...(dificult.toFixed(3) % 2 === 0 //fixo em 3 casas decimais
          ? {
              invertColor: !invertColor // cor ao contrario !
            }
          : {}),
        dificult: dificult + 0.005, // Aqui é a velocidade em que o jogo acontece / essas sao as casas decimais (0.005) e sao 3 do tofixed do de cima
        score: Math.ceil(score + 0.01 * dificult)
      });
    }, 100);
  }

  setControls = () => {
    document.addEventListener("keydown", e => {
      const { play, jumForce, gameOver } = this.state;

      if (gameOver) {
        return window.location.reload(); // qualquer tecla faz um reload
      }

      switch (e.which) { // ve qual tecla foi pressionada
        case KEYCODES.SPACE: // espaco 
        case KEYCODES.UP: // ou up ...
          if (!play) return this.play(); // se for falso chama o play
          if (jumForce === 0) { // se nao chama o jump
            return this.jump();
          }
          return;
        case KEYCODES.DOWN: // se for down
          if (!play) return this.play();
          return this.lower();
        default:
          return;
      }
    });

    document.addEventListener("keyup", e => {
      switch (e.which) {
        case KEYCODES.DOWN:
          return this.run();
        default:
          return;
      }
    });
  };

  play = () => {
    const { play } = this.state; // nao atualiza o state
    if (!play) {
      this.setState(
        {
          play: true, // começa o jogo
          activeSequence: "run" // o dino começa a corre
        },
        () => this.gravity()
      );
    }
  };

  jump = () => {
    this.setState({
      activeSequence: "iddle2",
      jumForce: -FORCA_PULO
    });
  };

  lower = () => {
    this.setState({
      activeSequence: "loweredRun",
      position: Math.min(INITIAL_PLAYER_POSITION + 42, this.state.position + 42)
    });
  };

  run = () => { // reseta variaveis
    this.setState({
      activeSequence: "run",
      falling: false,
      jumForce: 0,
      position: INITIAL_PLAYER_POSITION
    });
  };

  gravity = () => {
    const { play, position, jumForce, falling } = this.state;

    const newPosition = position + jumForce * FPS;
    if (newPosition < INITIAL_PLAYER_POSITION) {
      const newJumpForce = jumForce + GRAVIDADE * FPS;
      this.setState({
        jumForce: newJumpForce,
        position: newPosition,
        falling: true // cai
      });
    } else if (falling) { // se cair for true ele corre
      this.run();
    }

    if (play) requestAnimationFrame(this.gravity); // so se tiver no play
  };

  onCloudDisappear = cloudIndex => () => {
    const { cloud } = this.state;
    const cpCloud = JSON.parse(JSON.stringify(cloud)); // cria uma copia de tudo do cloud para nao ter problemas
    const currentClound = cpCloud[cloudIndex];

    currentClound.x = document.body.offsetWidth + Math.random() * 300; // x randomico
    currentClound.y = 200 + Math.random() * 150; // y randomico no minimo 200
    currentClound.speed = 1 + Math.random() * 6; // velocidade no minimo de 1 
    cpCloud.splice(cloudIndex, 1, currentClound); // remove um elemento e insere um no caso o currentCloud

    this.setState({ // seta no state
      cloud: cpCloud
    });
  };

  onPterodactylDisappear = () => {
    const { pterodactyl } = this.state;
    const cpPterodactyl = JSON.parse(JSON.stringify(pterodactyl));

    cpPterodactyl.x =
      document.body.offsetWidth +
      Math.random() * document.body.offsetWidth * 10; // entre 1 e 10 telas ele aparece
    cpPterodactyl.y = 200 + Math.random() * 5 * 20; // no minimo 200 de altura mas pode muda

    this.setState({
      pterodactyl: cpPterodactyl
    });
  };

  onCactusDisappear = cactusIndex => () => {
    const { cactus } = this.state; // mesma coisa q this.state.cactus
    const cpCactus = JSON.parse(JSON.stringify(cactus)); // clona o cactus
    const currentCactus = cpCactus[cactusIndex]; // pega o index
    const orderCactus = [...cpCactus].sort((a, b) => (a.x < b.x ? 1 : -1))[0]; // copia e faz um sort para retorna uma ordem 

    const randomIndex = Math.floor(Math.random() * CACTUS_SEQUENCES.length);

    currentCactus.x = Math.max( // calcula a distancia de aparecimento do cacto, pega a maior distancia
      document.body.offsetWidth,
      orderCactus.x + Math.random() * 200
    );
    currentCactus.sequence = CACTUS_SEQUENCES[randomIndex];

    if (randomIndex > 2) {
      currentCactus.y = 325; // cacto grende
    } else {
      currentCactus.y = 355; // cacto pequeno
    }

    cpCactus.splice(cactusIndex, 1, currentCactus);// remove um elemento e insere um no caso o currentCactus

    this.setState({
      cactus: cpCactus
    });
  };

  gameOver = () => {
    if (this.state.play) {
      setTimeout(() => {
        this.setState({
          activeSequence: "die",
          gameOver: true,
          play: false
        });
      }, 0);
    }
  };

  render() {
    const {
      dificult,
      cloud,
      cactus,
      pterodactyl,
      play,
      activeSequence,
      position,
      gameOver,
      score,
      invertColor
    } = this.state;

    return (
      <div
        className="App"
        style={{
          filter: `invert(${+invertColor})`
        }}
      >
        <div className="title">  T-Rex!</div>
        <div className="sub-title">PONTOS: {score}</div>

        <SpriteMapper // comeca o jogo
          src="/images/t-rex-sprite.png"
          cuts={cuts}
          sequences={sequences}
          fps={FPS}
        >
          {cloud.map((e, i) => ( // nuvens
            <Sprite
              key={i}
              play={play}
              sequence="cloud" // sequencia fixa da nuvem
              movingX={-e.speed * dificult}
              x={e.x}
              y={e.y}
              onDisappear={this.onCloudDisappear(i)}
            />
          ))}

          {cactus.map((e, i) => (
            <Sprite
              key={i}
              play={play}
              sequence={e.sequence} // sequencia variavel
              movingX={-CHAO_VELOCIDADE * dificult}
              x={e.x}
              y={e.y}
              hitTest={{ // ve se ta encostando no dino pra ver se colidiu
                position: {
                  x: INITIAL_PLAYER_LEFT,
                  y: position
                },
                rect: cuts[sequences.run[0]]
              }}
              onHit={this.gameOver} // callBack que fala q teve colisao e chama o gameOver
              onDisappear={this.onCactusDisappear(i)}
            />
          ))}

          <Sprite
            play={play}
            sequence="flyingEnemy" 
            movingX={-1.2 * ((dificult * CHAO_VELOCIDADE) / 18) * FPS} // batida da asa
            x={pterodactyl.x}
            y={pterodactyl.y}
            fps={18}
            hitTest={{
              position: {
                x: INITIAL_PLAYER_LEFT,
                y: position
              },
              rect: cuts[sequences.run[0]]
            }}
            onHit={this.gameOver}
            onDisappear={this.onPterodactylDisappear}
          />

          <Sprite
            play={play}
            sequence={activeSequence}
            y={position}
            x={INITIAL_PLAYER_LEFT}
          />

          {gameOver ? ( // se gameOver for true
            <Sprite
              sequence="gameOver" // x e y para a posicao de aparecer gamer over
              y={200}
              x={
                document.body.offsetWidth / 2 -
                cuts[sequences.gameOver[0]].width / 2
              }
            />
            // se nao retorna null
          ) : null } 

          <Sprite // sprite do chao
            play={play}
            sequence="ground"
            y={CHAO_POSICAO}
            movingX={-CHAO_VELOCIDADE * dificult} // - pq é da esquerda pra direita e a dificuldade para a velocidade
          />
        </SpriteMapper>
      </div>
    );
  }
}

export default App;
