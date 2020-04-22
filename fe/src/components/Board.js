import React from 'react';
import { useSelector } from 'react-redux';

import PriestRevealCardModal from './PriestRevealCardModal';

import {
  activePlayerIdSelector,
  gameStateSelector,
  playersSelector,
  priestRevealCardSelector,
} from '../store/selectors';
import PlayerView from './PlayerView';
import { STATE_PENDING } from '../constants';

function Board() {
  const activePlayerId = useSelector(activePlayerIdSelector);
  const gameState = useSelector(gameStateSelector);
  const players = useSelector(playersSelector);
  const priestRevealCard = useSelector(priestRevealCardSelector);

  if (gameState === STATE_PENDING) {
    return (
      <>
        <h1>Waiting for game to start...</h1>
      </>
    );
  }

  const hasPriestRevealCard = typeof priestRevealCard === 'number';

  return (
    <>
      {
        Object.values(players).map(player => {
          return (
            <PlayerView
              key={player.id}
              player={player}
              allPlayers={players}
              active={player.id === activePlayerId}
            />
          )
        })
      }
      {
        hasPriestRevealCard &&
          <PriestRevealCardModal
            hasPriestRevealCard={hasPriestRevealCard}
            priestRevealCard={priestRevealCard}
          />
      }
    </>
  );
}

export default Board;
