import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { currPlayerSelector, playersSelector, socketSelector, unclaimedRolesSelector } from '../../store/selectors';
import { LABELS } from '../../constants';

function RobberView() {
  const [playerToRobId, setPlayerToRobId] = useState(null);
  const players = useSelector(playersSelector);
  const currPlayer = useSelector(currPlayerSelector);
  const socket = useSelector(socketSelector);
  const otherPlayers = Object.values(players).filter(player => player.id !== currPlayer.id);
  const playerToRob = playerToRobId ? players[playerToRobId] : null;

  const robRole = () => {
    socket.emit('playerAction', {
      action: 'robRole',
      playerId: playerToRobId,
    });
  };

  const renderPlayerButton = player => {
    return (
      <Button key={player.id} onClick={() => setPlayerToRobId(player.id)}>{player.name}</Button>
    );
  };

  return (
    <>
      <h1>Wake up.</h1>
      <p>
        Choose another player. You will switch roles with that player and then look at your
        new role.
      </p>
      {
        !playerToRob &&
          <ButtonGroup className='mr-2'>
            {otherPlayers.map(renderPlayerButton)}
          </ButtonGroup>
      }
      {
        playerToRob &&
          <>
            <Row className='my-3'>
              <Col>
                <p>Your new role is: {LABELS[playerToRob.role]}</p>
              </Col>
            </Row>
            <Row className='my-3'>
              <Col>
                <Button onClick={robRole}>Go back to sleep</Button>
              </Col>
            </Row>
          </>
      }
    </>
  );
}

export default RobberView;
