import io from 'socket.io-client';

import * as actions from './actions';
import * as constants from '../constants';
import testAwpGameData from './testWavelengthGameData';
import testDeceptionGameData from './testDeceptionGameData';
import testPlayersData from './testPlayersData';
import testWavelengthGameData from './testWavelengthGameData';
import testWerewolfGameData from './testWerewolfGameData';


// Change to 1 to develop UI
const useTestState = 0;

const { env } = constants;

const initialState = {
  alerts: [],
  currUserId: null,
  debugEnabled: env !== 'production',
  gameData: {
    players: {},
  },
  roomData: {
    selectedGame: null,
    users: {},
  },
  nextAlertId: 0,
  socketConnected: false,
  messages: [],
  showAboutModal: false,
  showReleaseNotesModal: false,
  showRolesModal: false,
  showRulesModal: false,
  socket: null,
  userPreferences: {},
};

//const testGameDataToUse = testAwpGameData;
//const testGameDataToUse = testWerewolfGameData;
//const testGameDataToUse = testWavelengthGameData;
const testGameDataToUse = testDeceptionGameData;

const testState = {
  alerts: [
    //{
      //id: 0,
      //message: 'Gordon is dumb!',
      //type: 'danger',
    //},
    //{
      //id: 1,
      //message: 'No he\'s not!',
      //type: 'primary',
    //},
  ],
  currUserId: 'gordon',
  debugEnabled: env !== 'production',
  gameData: testGameDataToUse,
  name: 'Gordon',
  nextAlertId: 5,
  roomData: {
    selectedGame: null,
    state: constants.ROOM_STATE_GAME,
    users: {
      gordon: {
        id: 'gordon',
        name: 'Gordon',
        isLeader: true,
      },
      steve: {
        id: 'steve',
        name: 'Steve',
        isSpectator: true,
      },
      yuriko: {
        id: 'yuriko',
        name: 'Yuriko',
      },
    },
  },
  showAboutModal: false,
  showRulesModal: false,
  socket: null,
  userPreferences: {},
};

const stateToUse = useTestState ? testState : initialState;

const colors = [
  'indigo',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'warning',
  'danger',
];

const getColorForPlayerName = name => {
  const letters = name.split('');
  const charCodes = letters.map(letter => letter.charCodeAt(0));
  const sum = charCodes.reduce((currSum, currCode) => currSum + currCode);
  return colors[sum % colors.length];
};

export default function reducer(state = stateToUse, action) {
  let name, newAlerts, newPlayers, newUsers, players;

  switch(action.type) {
    case actions.CLEAR_NAME:
      return {
        ...state,
        name: undefined,
      };

    case actions.CONNECT_SOCKET:
      state.socket.open();
      return {
        ...state,
        socketConnected: true,
      }

    case actions.DISMISS_ALERT:
      const { id } = action.payload;
      const { alerts } = state;
      const alertIdx = alerts.findIndex(alert => alert.id === id);
      return {
        ...state,
        alerts: [
          ...alerts.slice(0, alertIdx),
          ...alerts.slice(alertIdx+1),
        ],
      };

    case actions.DISCONNECT_SOCKET:
      state.socket.close();
      return {
        ...state,
        gameData: null,
        name: null,
        roomData: null,
        socketConnected: false,
      }

    case actions.NEW_SOCKET:
      if (state.socket) {
        return state;
      }
      const ioServerDomain = (env === 'production') ? '/' : 'http://localhost:5000';
      return {
        ...state,
        socket: io(ioServerDomain),
      };

    case actions.NEW_USER:
      const userId = action.payload.id;
      name = action.payload.name;
      const oldUser = state.roomData?.users[userId] || {};

      newAlerts = [...state.alerts];
      const shouldShowAlert = userId !== state.currUserId;

      if (shouldShowAlert) {
        newAlerts.push({
          id: state.nextAlertId,
          message: `${name} has connected`,
          type: 'info',
        });
      }

      return {
        ...state,
        // Add an alert to notify that a new user has connected
        alerts: newAlerts,
        // Increment the id for the next alert
        nextAlertId: shouldShowAlert ? state.nextAlertId + 1 : state.nextAlertId,
        roomData: {
          ...state.roomData,
          users: {
            ...state.roomData?.users,
            [userId]: {
              ...oldUser,
              ...action.payload,
            },
          },
        },
      };

    // When another user has disconnected
    case actions.USER_DISCONNECT:
      const disconnectedUserId = action.payload.userId;
      const disconnectedUser = state.roomData?.users[disconnectedUserId];
      const playerName = disconnectedUser && disconnectedUser.name;

      newUsers = {};

      Object.keys(state.roomData?.users).forEach(userId => {
        newUsers[userId] = state.roomData?.users[userId];
        if (disconnectedUserId === userId) {
          newUsers[userId].connected = false;
        }
      });

      newAlerts = state.alerts;

      if (playerName) {
        newAlerts = [
          ...state.alerts,
          {
            id: state.nextAlertId,
            message: `${playerName} has disconnected`,
            type: 'danger',
          }
        ];
      }

      return {
        ...state,
        // Add an alert to notify that the user has disconnected
        alerts: newAlerts,
        // Increment the id for the next alert
        nextAlertId: state.nextAlertId + 1,
        roomData: {
          ...state.roomData,
          users: newUsers,
        },
        // Mark the user as disconnected
        players: {
          ...state.gameData.players,
          [disconnectedUserId]: {
            ...state.gameData.players[disconnectedUserId],
            connected: false,
          },
        },
      }

    case actions.NEW_ALERT:
      const { message, type } = action.payload;
      let { nextAlertId } = state;

      const alert = {
        id: nextAlertId,
        message,
        type,
      };
      return {
        ...state,
        alerts: [...state.alerts, alert],
        nextAlertId: nextAlertId + 1,
      };

    case actions.RECEIVE_DEBUG_INFO:
      console.log(action.payload);
      return state;

    case actions.RECEIVE_GAME_DATA:
      const fieldsFromClient = ['showRolesModal'];
      const dataFromClient = {};
      fieldsFromClient.forEach(field => {
        dataFromClient[field] = state.gameData && state.gameData[field];
      });

      players = action.payload.players;

      newPlayers = {};

      if (players) {
        Object.keys(players).forEach((playerId, idx) => {
          let color;
          if (action.payload.gameId === constants.GAME_WEREWOLF) {
            color = 'indigo';
          } else {
            color = getColorForPlayerName(players[playerId].name);
          }
          newPlayers[playerId] = {
            ...state.gameData.players[playerId],
            ...players[playerId],
            color,
          }
        });
      }

      return {
        ...state,
        gameData: {
          ...action.payload,
          ...dataFromClient,
          players: newPlayers,
        },
      };

    case actions.RECEIVE_ROOM_DATA:
      const newRoomData = action.payload;
      const { roomData } = state;

      return {
        ...state,
        roomData: {
          ...roomData,
          ...newRoomData,
        },
      };

    case actions.RECEIVE_USER_ID:
      const receivedUserId = action.payload;
      window.localStorage.setItem('socketId', receivedUserId);

      return {
        ...state,
        currUserId: receivedUserId,
      };

    case actions.SAVE_NAME:
      name = action.payload.name;
      const { isSpectator } = action.payload;

      return {
        ...state,
        debugEnabled: (name && name.toLowerCase() === 'gordon') || state.debugEnabled, // >_<
        name,
        isSpectator,
      };

    case actions.SET_ROOM_CODE:
      const { roomCode } = action.payload;

      return {
        ...state,
        roomCode,
      };

    case actions.SHOW_ALERT:
      return {
        ...state,
        alertMessage: action.payload,
      };

    case actions.TOGGLE_ABOUT_MODAL:
      return {
        ...state,
        showAboutModal: action.payload.show,
      };

    case actions.TOGGLE_RELEASE_NOTES_MODAL:
      return {
        ...state,
        showReleaseNotesModal: action.payload.show,
      };

    case actions.TOGGLE_ROLES_MODAL:
      if (!state.gameData) { return state; }
      return {
        ...state,
        gameData: {
          ...state.gameData,
          showRolesModal: action.payload.show,
        },
      };

    case actions.TOGGLE_RULES_MODAL:
      return {
        ...state,
        showRulesModal: action.payload.show,
      };

    case actions.UPDATE_SPECTRUM_GUESS:
      const newGameData = {
        ...state.gameData,
        spectrumGuess: action.payload.guess,
      };

      return {
        ...state,
        gameData: newGameData,
      };

    case actions.UPDATE_USER_PREFERENCE:
      const { userPreferences } = state;
      const { preferenceName, preferenceValue } = action.payload;
      userPreferences[preferenceName] = preferenceValue;

      return {
        ...state,
        userPreferences: {
          ...userPreferences,
          [preferenceName]: preferenceValue,
        },
      };

    default:
      return state;
  }
};
