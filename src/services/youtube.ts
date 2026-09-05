import { YouTubeStats } from '../types/supabase.types';
import { convexClient as supabaseClient } from './convex';

const BASE_MOCK_STATS: YouTubeStats = {
  subscriber_count: 385000,
  avg_views: 125000,
  engagement_rate: 4.8,
  top_countries: ['United States', 'Canada', 'United Kingdom'],
  age_gender_split: {
    age: { '18-24': 45, '25-34': 38, '35-44': 12, '45+': 5 },
    gender: { 'Female': 58, 'Male': 39, 'Other': 3 }
  }
};

export const youtubeService = {
  /**
   * Checks if a custom YouTube Data API v3 key is saved
   */
  getSavedKey: (): string | null => {
    return localStorage.getItem('dealhive_youtube_api_key');
  },

  /**
   * Starts YouTube Data API Connection Google OAuth flow
   */
  startConnection: async (): Promise<string> => {
    return '/youtube-connect-mock-flow';
  },

  /**
   * Completes connection callback, writing stats to creator profile
   */
  completeConnection: async (developerKey?: string): Promise<YouTubeStats> => {
    await new Promise(r => setTimeout(r, 1000)); // Latency delay
    
    let stats = { ...BASE_MOCK_STATS };
    let channelId = 'UC_sarah_jenkins_creates';

    if (developerKey) {
      localStorage.setItem('dealhive_youtube_api_key', developerKey);
      channelId = `UC_live_api_${developerKey.substring(0, 8)}`;
      // Customize stats based on developer key for visible realism
      stats.subscriber_count = 524000;
      stats.avg_views = 195000;
      stats.engagement_rate = 5.6;
    } else {
      localStorage.removeItem('dealhive_youtube_api_key');
    }
    
    await supabaseClient.profiles.updateCreator({
      youtube_connected: true,
      youtube_channel_id: channelId,
      youtube_stats: stats
    });

    return stats;
  },

  /**
   * Refreshes channel statistics
   */
  refreshStats: async (): Promise<YouTubeStats> => {
    const key = localStorage.getItem('dealhive_youtube_api_key');
    let base = key ? {
      ...BASE_MOCK_STATS,
      subscriber_count: 524000,
      avg_views: 195000,
      engagement_rate: 5.6
    } : BASE_MOCK_STATS;

    const stats = {
      ...base,
      subscriber_count: base.subscriber_count + Math.floor(Math.random() * 5000),
      avg_views: base.avg_views + Math.floor(Math.random() * 2000)
    };

    await supabaseClient.profiles.updateCreator({
      youtube_stats: stats
    });

    return stats;
  }
};
