import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Users, DollarSign, Calendar, Copy } from 'lucide-react';
import { channelService } from '../services/channelService.ts';
import { formatCurrency, getDefaultCurrency } from '../utils/currency.ts';
import { SUPPORTED_CURRENCIES } from '../types/index.ts';
import type { Channel, ChannelForm } from '../types/index.ts';

const DashboardPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user channels
  const { data: channelsData, isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: channelService.getChannels,
  });

  const channels = channelsData?.channels || [];

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: channelService.createChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      setShowCreateModal(false);
    },
  });

  // Join channel mutation
  const joinChannelMutation = useMutation({
    mutationFn: channelService.joinChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      setShowJoinModal(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your expense channels</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-secondary"
          >
            Join Channel
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Channel</span>
          </button>
        </div>
      </div>

      {/* Channels Grid */}
      {channels.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
            <Users size={40} className="text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No channels yet</h3>
          <p className="mt-2 text-gray-600">
            Create your first channel or join an existing one to get started.
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary"
            >
              Join Channel
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Channel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel: Channel) => (
            <ChannelCard key={channel._id} channel={channel} />
          ))}
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateModal && (
        <CreateChannelModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createChannelMutation.mutate(data)}
          isLoading={createChannelMutation.isPending}
        />
      )}

      {/* Join Channel Modal */}
      {showJoinModal && (
        <JoinChannelModal
          onClose={() => setShowJoinModal(false)}
          onSubmit={(inviteCode) => joinChannelMutation.mutate(inviteCode)}
          isLoading={joinChannelMutation.isPending}
        />
      )}
    </div>
  );
};

// Channel Card Component
const ChannelCard = ({ channel }: { channel: Channel }) => {
  const [showInviteCode, setShowInviteCode] = useState(false);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(channel.inviteCode);
    // You could add a toast notification here
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{channel.name}</h3>
          {channel.description && (
            <p className="text-gray-600 text-sm mt-1">{channel.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Users size={16} />
          <span>{channel.members.length}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center space-x-1">
          <DollarSign size={16} />
          <span>{formatCurrency(channel.totalExpenses, channel.currency)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar size={16} />
          <span>{new Date(channel.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Link
          to={`/channels/${channel._id}`}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          View Channel →
        </Link>
        <button
          onClick={() => setShowInviteCode(!showInviteCode)}
          className="text-gray-400 hover:text-gray-600"
          title="Show invite code"
        >
          <Copy size={16} />
        </button>
      </div>

      {showInviteCode && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-gray-700">{channel.inviteCode}</span>
            <button
              onClick={copyInviteCode}
              className="text-primary-600 hover:text-primary-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Channel Modal
const CreateChannelModal = ({ onClose, onSubmit, isLoading }: {
  onClose: () => void;
  onSubmit: (data: ChannelForm) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState<ChannelForm>({
    name: '',
    description: '',
    currency: getDefaultCurrency(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Channel</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel Name
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., Room Groceries"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              className="input-field"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              All expenses in this channel will use this currency
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Brief description of this channel"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Join Channel Modal
const JoinChannelModal = ({ onClose, onSubmit, isLoading }: {
  onClose: () => void;
  onSubmit: (inviteCode: string) => void;
  isLoading: boolean;
}) => {
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inviteCode.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Join Channel</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invite Code
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Enter the invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Joining...' : 'Join Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;