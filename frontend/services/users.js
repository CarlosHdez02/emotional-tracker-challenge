import Cookie from 'js-cookie'
export default class Users{
    token = Cookie.get('token')
    baseUrl = 'http://localhost:5050/users'

    async updateUserPassword(userId, newPassword){
        try{
            const response = await fetch(`${this.baseUrl}/change-password/${userId}`,{
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