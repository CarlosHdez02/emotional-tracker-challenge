import Cookie from 'js-cookie';
export default class APIService {
    baseUrl = 'http://localhost:5050/api'
    token = Cookie.get('token')

    async getEmotionInformationById(id) {

        try {
            const response = await fetch(`${this.baseUrl}/emotions/emotion/${id}`)
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json()
            return data
        } catch (err) {
            console.error(err, "err at fetch")
            throw err; 
        }
    }

    async createNewUserEmotion(emotionData) {
        try {
            const response = await fetch(`${this.baseUrl}/emotions`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    ...emotionData
                })
            })
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json()
            return data
        } catch (err) {
            console.error(err, "err at fetch")
            throw err;
        }
    }

    async updateUserEmotion(emotionId, emotionData) {
        try {
            const response = await fetch(`${this.baseUrl}/emotions/${emotionId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(emotionData)
            })
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json()
            return data
        } catch (err) {
            console.error(err, "err at fetch")
            throw err;
        }
    }

    async getUserEmotionsSummary(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/summary/${userId}`)
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json()
            return data
        } catch (err) {
            console.error(err, "err at fetch")
            throw err;
        }
    }

    async getLoggedInUserEmotions() {
        try {
            // Get the token from cookies
            
            if (!this.token) {
                throw new Error('No authentication token found');
            }
            
            const response = await fetch(`${this.baseUrl}/emotions`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            return await response.json();
        } catch (err) {
            console.error(err, "err at fetch");
            throw err;
        }
    }   
    
    async updateUserPassword(newPassword){
        try{
            const response = await fetch(`${this.baseUrl}/t`,{
                method:"PATCH",
                headers:{
                    'Content-Type':'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body:JSON.stringify(newPassword)

            })
            const data = await response.json()
            return data;
        }catch(err){
            console.error(err,"here")
        }
    }
}