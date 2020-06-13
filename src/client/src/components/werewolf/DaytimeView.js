import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'

import PlayerLabel from './PlayerLabel';
import {
  LABELS,
  ROLE_WEREWOLF,
  ROLE_MINION,
  ROLE_MASON,
  ROLE_SEER,
  ROLE_ROBBER,
  ROLE_TROUBLEMAKER,
  ROLE_DRUNK,
  ROLE_INSOMNIAC,
  ROLE_HUNTER,
  ROLE_VILLAGER,
  ROLE_DOPPELGANGER,
  ROLE_TANNER,
  STATE_WW_VOTING,
} from '../../constants';
import * as selectors from '../../store/selectors';

const nonWakeUpRoles = [
  ROLE_WEREWOLF,
  ROLE_MINION,
  ROLE_MASON,
  ROLE_DRUNK,
  ROLE_HUNTER,
  ROLE_VILLAGER,
  ROLE_TANNER,
];

const wakeUpOrder = [
  ROLE_DOPPELGANGER,
  ROLE_SEER,
  ROLE_ROBBER,
  ROLE_TROUBLEMAKER,
  ROLE_INSOMNIAC,
];

const getRoleLabelClasses = role => cx('role-label', {
  werewolf: [ROLE_WEREWOLF, ROLE_MINION].includes(role),
  tanner: [ROLE_TANNER].includes(role),
  villager: ![ROLE_WEREWOLF, ROLE_MINION, ROLE_TANNER].includes(role),
});

const renderTurnOrder = (sessionRoles) => {
  const components = [];
  wakeUpOrder.forEach(wakeUpRole => {
    if (sessionRoles.includes(wakeUpRole)) {
      components.push(
        <div className={getRoleLabelClasses(wakeUpRole)}>{LABELS[wakeUpRole]}</div>
      );
    }
  });
  return components.reduce((combined, currComponent, idx) => {
    if (idx === 0) { return combined; }

    return (
      <>
        {combined}{' '}
        →
        {' '}{currComponent}
      </>
    );
  }, components[0]);
};

function DaytimeView() {
  const [playerToEliminate, setPlayerToEliminate] = useState(null);
  const [notes, setNotes] = useState('');
  const gameState = useSelector(selectors.gameStateSelector);
  const players = useSelector(selectors.playersSelector);
  const currPlayer = useSelector(selectors.currPlayerSelector);
  const socket = useSelector(selectors.socketSelector);
  const unclaimedRoles = useSelector(selectors.unclaimedRolesSelector);
  const votes = useSelector(selectors.votesSelector);

  const otherPlayers = Object.values(players).filter(player => player.id !== currPlayer.id);

  const startVoting = () => socket.emit('playerAction', { action: 'startVoting' });

  const onEditVote = suspectId => {
    setPlayerToEliminate(suspectId);
    socket.emit(
      'playerAction',
      {
        action: 'voteToEliminate',
        suspectId: suspectId,
      },
    )
  };

  const renderPlayerButton = player => {
    return (
      <ToggleButton name='playerToEliminate' key={player.id} value={player.id}>
        {player.name}
      </ToggleButton>
    );
  };

  const playerRoles = Object.values(players).map(player => player.role);
  const sessionRoles = playerRoles.concat(unclaimedRoles);
  const sessionNonWakeRoles = nonWakeUpRoles.filter(
    nonWakeUpRole => sessionRoles.includes(nonWakeUpRole)
  );

  return(
    <div className='px-5'>
      <div className='mb-5'>
        <h1>🌞</h1>
        <h1>Good morning!</h1>
        <p>
          The village needs to vote on who to eliminate. Start deliberating!
        </p>
      </div>
      <div>
        <h3>Wake order</h3>
        <p>
          {renderTurnOrder(sessionRoles)}
        </p>
        <h3>Non-wake roles</h3>
        {
          sessionNonWakeRoles.map(
            role => <><div className={getRoleLabelClasses(role)}>{LABELS[role]}</div><br/></>
          )
        }
      </div>
      {
        gameState !== STATE_WW_VOTING &&
          <Button onClick={startVoting}>Start Voting</Button>
      }
      {
        gameState === STATE_WW_VOTING &&
          <Row>
            <Col xs={6} className='text-center'>
              <h3>Time to vote!</h3>
              <em><small>You can change your vote until all votes are in</small></em>
              <br />
              <ToggleButtonGroup
                onChange={onEditVote}
                vertical
                name='playerToEliminate'
                value={playerToEliminate}
              >
                {otherPlayers.map(renderPlayerButton)}
                {renderPlayerButton(currPlayer)}
              </ToggleButtonGroup>
            </Col>
            <Col xs={6} className='text-center'>
              <h3>Votes cast</h3>
              {
                Object.values(players).map(player =>
                  <div>
                    <span className={cx('mr-1', { invisible: !votes[player.id] })}>✅</span>
                    <PlayerLabel player={player} />
                  </div>
                )
              }
            </Col>
          </Row>
      }
      <Row className='my-5'>
        <Col md={{ span: 8, offset: 2 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
        <Form.Group>
          <Form.Label>You may take notes in this area</Form.Label>
          <Form.Control
            as="textarea"
            rows="3"
            placeholder="Enter notes here"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </Form.Group>
        </Col>
      </Row>
    </div>
  );
}

export default DaytimeView;
