import Cookie from 'js-cookie'

export default class Reminders{
baseUrl = 'http://localhost:5050/api/reminder'
token = Cookie.get('token')


    async getUserReminder(){
        try{
            const response = await fetch(`${this.baseUrl}`,{
                headers:{
                    'Authorization': `Bearer ${this.token}`
                }
            })
            if(!response.ok){
                throw new Error (`HTTP error ${response.status}`)
            }
            const data = await response.json()
            return data;
        }catch(err){
            console.error(err,"err at reminder service")
        }
    }

    async getUserReminderById(reminderId){
        try{
            const response = await fetch(`${this.baseUrl}/${reminderId}`,{
                headers:{
                    'Authorization': `Bearer ${this.token}`
                }})
                if(response.ok){
                    throw new Error(`$HTTP error ${response.status}`)
                }
        }catch(err){
            console.error(err)
        }
    }
    async createNewReminder(reminderData){
        try{
            const response = await fetch(`${this.baseUrl}`,{
                method:"POST",
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${this.token}`
                },
                body:JSON.stringify({...reminderData})
            })
            if(!response.ok){
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json()
            return data;
        }catch(err){
            console.error(err,"err at service")
        }
    }
    async updateUserReminder(reminderId,reminderData){
        try{
            const response = await fetch(`${this.baseUrl}/reminder/${reminderId}`,{
                method:"PUT",
                headers:{
                    'Content-Type':'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({...reminderData})
            })
            if(!response.ok){
                throw new Error(`HTTP error ${response.status}`)
              
            }
            const data = response.json()
            return data
        }catch(err){
            console.error(err,"err at fet")
        }
    }

    async updateReminderStatus(reminderId,status){
        const response = await fetch(`${this.baseUrl}/reminder/toggle${reminderId}`,{
            method:"PATCH",
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${this.token}`
            },
            body:JSON.stringify({...status})
        })
        if(!response.ok){
            throw new Error(`HTTP error ${response.status}`)
        }
    }
}