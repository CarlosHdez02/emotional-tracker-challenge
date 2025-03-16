import Cookie from 'js-cookie'

export default class Reminders {
    baseUrl = 'http://localhost:5050/api/reminders'
    token = Cookie.get('token') 
   
    
    async getUserReminder() {
        try {
            const response = await fetch(`${this.baseUrl}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err, "err at reminder service");
            throw err; // Re-throw so calling code can handle it
        }
    }
    
    async getUserReminderById(reminderId) {
        try {
            const response = await fetch(`${this.baseUrl}/${reminderId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    
    async createNewReminder(reminderData) {
        try {
            const response = await fetch(`${this.baseUrl}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({...reminderData})
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err, "err at service");
            throw err;
        }
    }
    
    async updateUserReminder(reminderId, reminderData) {
        try {
            // Check if this path is correct - removed extra "reminder"
            const response = await fetch(`${this.baseUrl}/${reminderId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({...reminderData})
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err, "err at fetch");
            throw err;
        }
    }
    
    async updateReminderStatus(reminderId, status) {
        try {
            // Fixed URL path - added slash after "toggle"
            const response = await fetch(`${this.baseUrl}/toggle/${reminderId}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({...status})
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err, "err at toggle status");
            throw err;
        }
    }
}