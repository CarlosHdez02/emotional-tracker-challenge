import IdentifyPatternService from "../services/identifyPatterns";
import React from "react";
import Cookie from "js-cookie";

export const IdentifyContext = React.createContext();
const identifyPatterns = new IdentifyPatternService();

export const IdentifyPatternProvider = ({ children }) => {
  //  in my backend service i get all the emotions
  //  in here i will make the filtering

  const [emotionsPatterns, setEmotionsPatterns] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const getEmotionsPatterns = async (userId) => {
    //const token = Cookie.get("token");

    try {
        setLoading(true)
      const response = await identifyPatterns.identifyPatternService(userId);
      setEmotionsPatterns(response.data); //  emotions
      //  going
    } catch (err) {
      setError(err);
      console.error(err);
    }finally{
        setLoading(false)
    }
  };
  return(
    <IdentifyContext.Provider
        value={{
            emotionsPatterns,
            loading,
            error,
            getEmotionsPatterns
        }}
    >
        {children}
    </IdentifyContext.Provider>
  )
};
