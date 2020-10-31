import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import CluePhase from './CluePhase';
import GameEndPhase from './GameEndPhase';
import GuessPhase from './GuessPhase';
import LeaderPanel from '../LeaderPanel';
import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import PointsTable from './PointsTable';
import RevealPhase from './RevealPhase';
import SpectatorList from '../common/SpectatorList';
import * as selectors from '../../store/selectors';
import {
  STATE_WAVELENGTH_CLUE_PHASE,
  STATE_WAVELENGTH_GUESS_PHASE,
  STATE_WAVELENGTH_REVEAL_PHASE,
  STATE_WAVELENGTH_GAME_END_PHASE,
} from '../../constants';

function WavelengthBoard() {
  const activePlayer = useSelector(selectors.activePlayerSelector);
  const currUserIsSpectator = useSelector(selectors.currUserIsSpectatorSelector);
  const gameState = useSelector(selectors.gameStateSelector);
  const numRoundsLeft = useSelector(selectors.numRoundsLeftSelector);
  const { playersReady } = useSelector(selectors.gameDataSelector);
  const users = useSelector(selectors.usersSelector);
  let wavelengthGuessers = useSelector(selectors.wavelengthGuessersSelector);
  wavelengthGuessers = wavelengthGuessers.filter(player => player.connected);

  return (
    <div className='board py-5'>
      <Row>
        <Col sm={8} className='main-panel py-5'>
          {gameState !== STATE_WAVELENGTH_GAME_END_PHASE && <PointsTable/>}
          { gameState === STATE_WAVELENGTH_CLUE_PHASE && <CluePhase /> }
          { gameState === STATE_WAVELENGTH_GUESS_PHASE && <GuessPhase /> }
          { gameState === STATE_WAVELENGTH_REVEAL_PHASE && <RevealPhase /> }
          { gameState === STATE_WAVELENGTH_GAME_END_PHASE && <GameEndPhase /> }
        </Col>
        <Col sm={4} className='main-panel text-center py-5'>
          {
            !currUserIsSpectator &&
              <LeaderPanel numUsers={Object.keys(users).length}/>
          }
          <div className='text-center my-4'>
            <u>Turns Left</u>
            <br />
            {numRoundsLeft}
          </div>
          {
            activePlayer &&
              <>
                <h3><u>Psychic</u></h3>
                <div className={`inline-player-label player-label ${activePlayer.color}`}>
                  {activePlayer.name}
                </div>
              </>
          }
          <h3 className='mt-5'><u>Guessers</u></h3>
          {
            wavelengthGuessers.map(wavelengthGuesser =>
              <>
                <PlayerCheckboxLabel
                  player={wavelengthGuesser}
                  checked={playersReady[wavelengthGuesser.id]}
                />
                <br />
              </>
            )
          }
          <SpectatorList />
        </Col>
      </Row>
    </div>
  );
}

export default WavelengthBoard;
