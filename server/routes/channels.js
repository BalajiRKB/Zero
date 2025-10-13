const express = require('express');
const {
  getChannels,
  createChannel,
  getChannel,
  joinChannel,
  updateChannel,
  deleteChannel
} = require('../controllers/channelController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   GET /api/channels
router.get('/', getChannels);

// @route   POST /api/channels
router.post('/', createChannel);

// @route   GET /api/channels/:id
router.get('/:id', getChannel);

// @route   PUT /api/channels/:id
router.put('/:id', updateChannel);

// @route   DELETE /api/channels/:id
router.delete('/:id', deleteChannel);

// @route   POST /api/channels/join/:inviteCode
router.post('/join/:inviteCode', joinChannel);

module.exports = router;