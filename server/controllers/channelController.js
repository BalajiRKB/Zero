const Joi = require('joi');
const Channel = require('../models/Channel');
const User = require('../models/User');

// Validation schemas
const channelSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'KRW', 'SEK', 'NOK', 'DKK', 'SGD', 'HKD').optional()
});

// @desc    Get all user channels
// @route   GET /api/channels
// @access  Private
const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({
      'members.user': req.user.id,
      isActive: true
    })
    .populate('creator', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      channels
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new channel
// @route   POST /api/channels
// @access  Private
const createChannel = async (req, res) => {
  try {
    const { error, value } = channelSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description, currency } = value;

    // Get user's default currency if not provided
    const user = await User.findById(req.user.id);
    const channelCurrency = currency || user.defaultCurrency || 'USD';

    // Generate unique invite code
    let inviteCode;
    let isUnique = false;
    
    while (!isUnique) {
      inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const existingChannel = await Channel.findOne({ inviteCode });
      if (!existingChannel) {
        isUnique = true;
      }
    }

    const channel = await Channel.create({
      name,
      description,
      currency: channelCurrency,
      creator: req.user.id,
      inviteCode,
      members: [{
        user: req.user.id,
        role: 'admin'
      }]
    });

    // Add channel to user's channels array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { channels: channel._id }
    });

    const populatedChannel = await Channel.findById(channel._id)
      .populate('creator', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      channel: populatedChannel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get channel by ID
// @route   GET /api/channels/:id
// @access  Private
const getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('creator', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is a member
    const isMember = channel.members.some(member => 
      member.user._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      channel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join channel by invite code
// @route   POST /api/channels/join/:inviteCode
// @access  Private
const joinChannel = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const channel = await Channel.findOne({ inviteCode, isActive: true });
    if (!channel) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if user is already a member
    const isMember = channel.members.some(member => 
      member.user.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this channel' });
    }

    // Add user to channel
    channel.members.push({
      user: req.user.id,
      role: 'member'
    });
    await channel.save();

    // Add channel to user's channels array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { channels: channel._id }
    });

    const populatedChannel = await Channel.findById(channel._id)
      .populate('creator', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Successfully joined channel',
      channel: populatedChannel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update channel
// @route   PUT /api/channels/:id
// @access  Private
const updateChannel = async (req, res) => {
  try {
    const { error, value } = channelSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is admin
    const member = channel.members.find(m => m.user.toString() === req.user.id);
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update channel details' });
    }

    const { name, description } = value;
    channel.name = name;
    channel.description = description;
    await channel.save();

    const populatedChannel = await Channel.findById(channel._id)
      .populate('creator', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      channel: populatedChannel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete channel
// @route   DELETE /api/channels/:id
// @access  Private
const deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is the creator
    if (channel.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only channel creator can delete the channel' });
    }

    // Soft delete - mark as inactive
    channel.isActive = false;
    await channel.save();

    // Remove channel from all users' channels array
    await User.updateMany(
      { channels: channel._id },
      { $pull: { channels: channel._id } }
    );

    res.json({
      success: true,
      message: 'Channel deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getChannels,
  createChannel,
  getChannel,
  joinChannel,
  updateChannel,
  deleteChannel
};