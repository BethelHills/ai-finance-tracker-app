// Fallback authentication for demo purposes
export interface FallbackUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export class FallbackAuth {
  private static users: FallbackUser[] = [];

  static async signUp(email: string, password: string, userData?: any) {
    console.log('🔄 Using fallback authentication...');
    
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      return {
        data: null,
        error: { message: 'User already exists with this email' }
      };
    }

    // Create new user
    const newUser: FallbackUser = {
      id: `fallback_${Date.now()}`,
      email,
      full_name: userData?.full_name || '',
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    
    console.log('✅ Fallback user created:', newUser);
    
    return {
      data: { user: newUser },
      error: null
    };
  }

  static async signIn(email: string, password: string) {
    console.log('🔄 Using fallback sign in...');
    
    const user = this.users.find(u => u.email === email);
    if (!user) {
      return {
        data: null,
        error: { message: 'User not found' }
      };
    }

    console.log('✅ Fallback sign in successful:', user);
    
    return {
      data: { user },
      error: null
    };
  }

  static getUsers() {
    return this.users;
  }
}
