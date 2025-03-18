import Cookie from 'js-cookie';

export default class DataSharing {
  constructor() {
    this.token = Cookie.get('token');
    this.baseUrl = 'http://localhost:5050/api';
  }

  async getAssignedTherapist() {
    try {
      const response = await fetch(`${this.baseUrl}/therapist/assigned`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get assigned therapist');
      }

      return data;
    } catch (err) {
      console.error('Error getting assigned therapist:', err);
      throw err;
    }
  }

  async assignTherapistToUser(email) {
    try {
      const response = await fetch(`${this.baseUrl}/therapist/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign therapist');
      }
      
      return data;
    } catch (err) {
      console.error('Error assigning therapist:', err);
      throw err;
    }
  }

  async shareEmotionsWithTherapist() {
    try {
      const response = await fetch(`${this.baseUrl}/therapist/share-emotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to share emotions with therapist');
      }
      
      return data;
    } catch (err) {
      console.error('Error sharing emotions with therapist:', err);
      throw err;
    }
  }

  async getTherapistDetails(therapistId) {
    try {
      const response = await fetch(`${this.baseUrl}/therapist/${therapistId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get therapist details');
      }
      
      return data;
    } catch (err) {
      console.error('Error getting therapist details:', err);
      throw err;
    }
  }

  async getUsers() {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      return data.data.users;
    } catch (err) {
      console.error(err, "err at fetch");
      throw err;
    }
  }
}