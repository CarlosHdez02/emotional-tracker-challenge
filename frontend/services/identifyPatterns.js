import Cookie from 'js-cookie'

export default class IdentifyPatternService{
    baseurl = 'http://localhost:5050/api/patterns'
    token = Cookie.get('token')



    async identifyPatternService(){
        try{
            const response = await fetch(`${this.baseurl}`,{
                headers:{
                    'Authorization': `Bearer ${this.token}`
                }  
            })
            if(!response.ok){
                throw new Error(`Http error ${response.status}`)
            }
            const data = await response.json()
            return data
        }catch(err){
            console.error(err,"err at service")
        }
    }
    
}