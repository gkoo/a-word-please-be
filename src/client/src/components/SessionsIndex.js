import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Layout from '../Layout';
import ListGroup from 'react-bootstrap/ListGroup'

import { API_BASE_URL, routePrefix } from '../constants';

function SessionsIndex() {
  const [sessionsData, setSessionsData] = useState(null);

  useEffect(() => {
    window.fetch(`${API_BASE_URL}/api/sessions`).then(response => {
      response.json().then(data => setSessionsData(data));
    });
  }, []);

  return (
    <Layout>
      <Row>
        <Col xs={6}>
          <h1>Rooms</h1>
          <ListGroup>
            {
              sessionsData?.rooms &&
                sessionsData.rooms.map(roomCode =>
                  <ListGroup.Item key={roomCode}>
                    <Link to={`${routePrefix}/rooms/${roomCode}`}>{roomCode}</Link>
                  </ListGroup.Item>
                )
            }
          </ListGroup>
        </Col>
      </Row>
    </Layout>
  );
}

export default SessionsIndex;
