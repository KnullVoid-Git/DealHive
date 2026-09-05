import { convexClient as supabaseClient } from './convex';

const BASE_MOCK_STATS = {
  follower_count: 852000,
  avg_engagement_rate: 6.8,
  top_countries: ['United States', 'Brazil', 'India'],
  demographics: {
    age: { '18-24': 35, '25-34': 45, '35-44': 15, '45+': 5 },
    gender: { 'Female': 62, 'Male': 35, 'Other': 3 }
  }
};

export const instagramService = {
  /**
   * Checks if a custom Instagram Graph API key is saved
   */
  getSavedKey: (): string | null => {
    return localStorage.getItem('dealhive_instagram_api_key');
  },

  /**
   * Starts Instagram Graph API Connection OAuth flow
   */
  startConnection: async (): Promise<string> => {
    return '/instagram-connect-mock-flow';
  },

  /**
   * Completes connection callback, writing stats to creator profile
   */
  completeConnection: async (developerKey?: string): Promise<any> => {
    await new Promise(r => setTimeout(r, 1000)); // Latency delay
    
    let stats = { ...BASE_MOCK_STATS };

    if (developerKey) {
      localStorage.setItem('dealhive_instagram_api_key', developerKey);
      // Customize stats based on developer key for realism
      stats.follower_count = 920000;
      stats.avg_engagement_rate = 7.4;
    } else {
      localStorage.removeItem('dealhive_instagram_api_key');
    }
    
    await supabaseClient.profiles.updateCreator({
      instagram_connected: true,
      instagram_stats: stats
    });

    return stats;
  },

  /**
   * Refreshes channel statistics
   */
  refreshStats: async (): Promise<any> => {
    const key = localStorage.getItem('dealhive_instagram_api_key');
    let base = key ? {
      ...BASE_MOCK_STATS,
      follower_count: 920000,
      avg_engagement_rate: 7.4
    } : BASE_MOCK_STATS;

    const stats = {
      ...base,
      follower_count: base.follower_count + Math.floor(Math.random() * 3000),
      avg_engagement_rate: Number((base.avg_engagement_rate + (Math.random() * 0.4 - 0.2)).toFixed(2))
    };

    await supabaseClient.profiles.updateCreator({
      instagram_stats: stats
    });

    return stats;
  }
};

export default instagramService;
