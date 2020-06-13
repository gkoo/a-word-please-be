import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import CardDeck from 'react-bootstrap/CardDeck';
import Modal from 'react-bootstrap/Modal';

import RoleCard from './RoleCard';
import {
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
} from '../../constants';
import { toggleRolesModal } from '../../store/actions';

const roles = [
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
];

function RolesModal({ show }) {
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const handleClose = () => showModal && dispatch(toggleRolesModal({ show: false }));

  useEffect(() => {
    if (show !== showModal) {
      setShowModal(show);
    }
  }, [show, showModal]);

  return (
    <Modal show={showModal} className='roles-modal' onHide={handleClose} scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Roles</Modal.Title>
      </Modal.Header>
      <Modal.Body className='roles-modal-body'>
        <CardDeck>
          {
            roles.map(role =>
              <RoleCard
                role={role}
                includeTeam={true}
              />
            )
          }
        </CardDeck>
      </Modal.Body>
    </Modal>
  );
}

export default RolesModal;
