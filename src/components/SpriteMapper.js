import * as React from "react";

// informacoes padroes

import "./SpriteMapper.scss";

const SpriteMapper = props => {
  const { sequences, cuts, src, fps, style } = props;

  return (
    <div className="SpriteMapper">
      {React.Children.map(props.children, child => {
        if (!child) return null; // so trabalha com aqueles objetos

        return React.cloneElement(child, { //clonas os objetos
          sequences,
          cuts,
          src,
          fps: child.props.fps || fps, // se ja exisitir usa ele se nao usa o padrao
          style
        });
      })}
    </div>
  );
};

export default SpriteMapper;
