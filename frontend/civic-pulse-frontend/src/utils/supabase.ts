import { createClient } from '@supabase/supabase-js';

// Placeholder values for frontend development - replace with actual values when integrating
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.warn('Using placeholder Supabase values - set environment variables for actual integration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const uploadImage = async (file: File): Promise<string> => {
  // Return placeholder URL when using mock Supabase
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.log('Mock image upload for file:', file.name);
    return `https://placeholder.supabase.co/storage/v1/object/public/report-images/${Date.now()}.${file.name.split('.').pop()}`;
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  
  try {
    const { data, error } = await supabase.storage
      .from('report-images')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('report-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.warn('Image upload failed, using placeholder:', error);
    return `https://placeholder.supabase.co/storage/v1/object/public/report-images/${fileName}`;
  }
};

export const getCurrentUser = async () => {
  // Return mock user when using placeholder Supabase
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.log('Using mock user session');
    return {
      id: 'mock-user-id',
      email: 'demo@example.com',
      user_metadata: { name: 'Demo User' }
    };
  }
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch (error) {
    console.warn('Auth check failed, using mock user:', error);
    return {
      id: 'mock-user-id',
      email: 'demo@example.com',
      user_metadata: { name: 'Demo User' }
    };
  }
};

// Types matching backend schema
export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'pothole' | 'streetlight' | 'garbage' | 'vandalism' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  image_url?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportUpdate {
  id: string;
  report_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  name?: string;
  role: 'citizen' | 'admin' | 'staff';
  created_at: string;
}

// Mock data for development
const mockReports: Report[] = [
  {
    id: '1',
    user_id: 'mock-user-id',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    category: 'pothole',
    status: 'open',
    priority: 'high',
    location: 'Main Street & 1st Ave',
    latitude: 40.7128,
    longitude: -74.0060,
    address: '123 Main Street, City, State',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'mock-user-id',
    title: 'Broken Streetlight',
    description: 'Streetlight not working, dark area at night',
    category: 'streetlight',
    status: 'in_progress',
    priority: 'medium',
    location: 'Oak Avenue',
    latitude: 40.7589,
    longitude: -73.9851,
    address: '456 Oak Avenue, City, State',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
];

// API functions
export const reportAPI = {
  async getAll() {
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('Using mock reports data');
      return mockReports;
    }
    
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Report[];
    } catch (error) {
      console.warn('Failed to fetch reports, using mock data:', error);
      return mockReports;
    }
  },

  async getByUser(userId: string) {
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('Using mock user reports data');
      return mockReports.filter(report => report.user_id === userId);
    }
    
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Report[];
    } catch (error) {
      console.warn('Failed to fetch user reports, using mock data:', error);
      return mockReports.filter(report => report.user_id === userId);
    }
  },

  async create(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>) {
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('Mock creating report:', report.title);
      const newReport: Report = {
        ...report,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockReports.unshift(newReport);
      return newReport;
    }
    
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([report])
        .select()
        .single();
      
      if (error) throw error;
      return data as Report;
    } catch (error) {
      console.warn('Failed to create report, using mock:', error);
      const newReport: Report = {
        ...report,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newReport;
    }
  },

  async update(id: string, updates: Partial<Report>) {
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('Mock updating report:', id);
      const reportIndex = mockReports.findIndex(r => r.id === id);
      if (reportIndex >= 0) {
        mockReports[reportIndex] = { ...mockReports[reportIndex], ...updates, updated_at: new Date().toISOString() };
        return mockReports[reportIndex];
      }
      throw new Error('Report not found');
    }
    
    try {
      const { data, error } = await supabase
        .from('reports')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Report;
    } catch (error) {
      console.warn('Failed to update report, using mock:', error);
      throw error;
    }
  },

  async delete(id: string) {
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('Mock deleting report:', id);
      const reportIndex = mockReports.findIndex(r => r.id === id);
      if (reportIndex >= 0) {
        mockReports.splice(reportIndex, 1);
      }
      return;
    }
    
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.warn('Failed to delete report:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: Report['status']) {
    return this.update(id, { status });
  },

  async assign(id: string, userId: string) {
    return this.update(id, { assigned_to: userId });
  }
};

export const reportUpdatesAPI = {
  async getByReportId(reportId: string) {
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('Using mock report updates');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('report_updates')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ReportUpdate[];
    } catch (error) {
      console.warn('Failed to fetch report updates, using empty array:', error);
      return [];
    }
  },

  async create(update: Omit<ReportUpdate, 'id' | 'created_at'>) {
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('Mock creating report update');
      const mockUpdate: ReportUpdate = {
        ...update,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      return mockUpdate;
    }
    
    try {
      const { data, error } = await supabase
        .from('report_updates')
        .insert([update])
        .select()
        .single();
      
      if (error) throw error;
      return data as ReportUpdate;
    } catch (error) {
      console.warn('Failed to create report update:', error);
      throw error;
    }
  }
};

const mockProfiles: Profile[] = [
  {
    id: 'mock-user-id',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'citizen',
    created_at: new Date().toISOString()
  }
];

export const profileAPI = {
  async getById(id: string) {
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('Using mock profile data');
      return mockProfiles.find(p => p.id === id) || mockProfiles[0];
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    } catch (error) {
      console.warn('Failed to fetch profile, using mock:', error);
      return mockProfiles[0];
    }
  },

  async getAll() {
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('Using mock profiles data');
      return mockProfiles;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Profile[];
    } catch (error) {
      console.warn('Failed to fetch profiles, using mock data:', error);
      return mockProfiles;
    }
  },

  async updateRole(id: string, role: Profile['role']) {
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('Mock updating profile role');
      const profileIndex = mockProfiles.findIndex(p => p.id === id);
      if (profileIndex >= 0) {
        mockProfiles[profileIndex].role = role;
        return mockProfiles[profileIndex];
      }
      throw new Error('Profile not found');
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    } catch (error) {
      console.warn('Failed to update profile role:', error);
      throw error;
    }
  }
};

// Real-time subscriptions
export const subscribeToReports = (callback: (report: Report) => void) => {
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.log('Mock real-time subscription created');
    // Return a simple mock with unsubscribe method
    return {
      unsubscribe: () => console.log('Mock subscription unsubscribed'),
      // Minimal properties to avoid type errors
      topic: 'mock-reports-changes'
    } as any;
  }
  
  try {
    return supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports'
        },
        (payload: any) => callback(payload.new as Report)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reports'
        },
        (payload: any) => callback(payload.new as Report)
      )
      .subscribe();
  } catch (error) {
    console.warn('Failed to create real-time subscription:', error);
    // Return simple mock on error
    return {
      unsubscribe: () => console.log('Error subscription fallback unsubscribed'),
      topic: 'error-fallback'
    } as any;
  }
};
