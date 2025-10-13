import api from './api.ts';
import type { Channel, ChannelForm } from '../types/index.ts';

export const channelService = {
  // Get all user channels
  getChannels: async (): Promise<{ success: boolean; channels: Channel[] }> => {
    const response = await api.get('/channels');
    return response.data;
  },

  // Create new channel
  createChannel: async (data: ChannelForm): Promise<{ success: boolean; channel: Channel }> => {
    const response = await api.post('/channels', data);
    return response.data;
  },

  // Get channel by ID
  getChannel: async (id: string): Promise<{ success: boolean; channel: Channel }> => {
    const response = await api.get(`/channels/${id}`);
    return response.data;
  },

  // Update channel
  updateChannel: async (id: string, data: ChannelForm): Promise<{ success: boolean; channel: Channel }> => {
    const response = await api.put(`/channels/${id}`, data);
    return response.data;
  },

  // Delete channel
  deleteChannel: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/channels/${id}`);
    return response.data;
  },

  // Join channel by invite code
  joinChannel: async (inviteCode: string): Promise<{ success: boolean; channel: Channel; message: string }> => {
    const response = await api.post(`/channels/join/${inviteCode}`);
    return response.data;
  }
};