import * as React from "react";

import "./Sprite.scss";

export class Rect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

// os valores em negativo(-) é pq ele vai da esquerda para a direita( <- )

export default class Sprite extends React.Component {
  state = {
    frame: 0,
    translateX: 0,
    translateY: 0,
    sequence: this.props.sequence
  };

  startTime = 0;

  static getDerivedStateFromProps(props, state) { // altera o estado a partir de uma propriedade
    if (props.sequence !== state.sequence) { // ve se alterou a sequencia
      return {
        frame: 0,
        sequence: props.sequence
      };
    }
    return null;
  }

  componentDidMount() { // quando inicia o componente/ pagina
    this.play();
  }

  play = () => {
    if (!this.startTime) this.startTime = Date.now();

    // vai trava uma quantidade de fps
    const { fps, play } = this.props;

    const elapsed = Date.now() - this.startTime;
    if (elapsed >= 1000 / fps) { 
      if (play) this.loop();
      this.startTime = Date.now() - (elapsed % (1000 / fps));
    }

    requestAnimationFrame(this.play);
  };

  loop = () => {
    const { frame, translateX, translateY } = this.state;
    const { sequence, sequences, movingX, movingY } = this.props;

    this.setState({
      frame: (frame + 1) % sequences[sequence].length, // quando muda o sprite volta e assim por diante como padrao
      translateX: movingX ? translateX + movingX : 0,
      translateY: movingY ? translateY + movingY : 0
    });
  };

  onDisappear = () => { // desaparecer
    const { onDisappear } = this.props;
    if (onDisappear) {
      setTimeout(() => {
        this.setState(
          {
            translateX: 0,
            translateY: 0
          },
          onDisappear // quando acaba o setState da um onDisapper
        );
      }, 0);
    }
  };

  onHit = () => {
    const { onHit } = this.props;
    if (onHit) onHit();
  };

  render() {
    const { frame, translateX, translateY } = this.state;
    const { sequences, cuts, style, src, sequence, y, x, hitTest } = this.props;

    const sequenceCuts = sequences[sequence].map(e => cuts[e]); // sequencia de cortes de animacao
    const currentCut = sequenceCuts[frame];

    const thisLeft = x + translateX;
    const thisRight = x + currentCut.width + translateX;
    const thisTop = y + translateY;
    const thisBottom = y + currentCut.height + translateY;

    if (thisRight < 0) { // ele some se passa da tela
      this.onDisappear();
    }

    if (hitTest) {
      const tolerancia = 10; // tolerancia para colisao

      const thatLeft = hitTest.position.x;
      const thatRight = hitTest.position.x + hitTest.rect.width;
      const thatTop = hitTest.position.y;
      const thatBottom = hitTest.position.y + hitTest.rect.height;

      const hitted =
        thatLeft + tolerancia > thisRight - tolerancia ||
        thatRight - tolerancia < thisLeft + tolerancia ||
        thatTop + tolerancia > thisBottom - tolerancia ||
        thatBottom - tolerancia < thisTop + tolerancia; // casos de NAO colisao

      if (!hitted) { // se for diferente dos casos de nao colisao ele colidiu
        this.onHit();
      }
    }

    return (
      <div
        className="Sprite"
        style={{
          ...style,
          left: `${x}px`,
          top: `${y}px`,
          ...(translateX || translateY
            ? {
                transform: `${
                  translateX
                    ? `translateX(${translateX}px)`
                    : `translateY(${translateY}px)`
                }`
              }
            : {}),
          backgroundImage: `url(${src})`,
          backgroundPosition: `-${currentCut.x}px -${currentCut.y}px`,
          height: `${currentCut.height}px`,
          width: `${currentCut.width}px`
        }}
      />
    );
  }
}
