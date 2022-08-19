import { useState, useEffect } from "react";

const getLocalValue = (key, initValue) => {
        //! if used in SSR we wont have access to the window object as it is running on the server
        if (typeof window === 'undefined') return initValue;
        //! if we passed a function just like in useState below just execute it
        if (initValue instanceof Function) return initValue();

        //! if a value is already store 
        const localValue = localStorage.getItem(key);
        if (localValue) return JSON.parse(localValue)

        return initValue;
    }
const useLocalStorage = (key,initialValue) => {

    
    const [value, setValue] = useState(()=>{
        return getLocalValue(key,initialValue)
    })
  
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value])
  
  
  return [value, setValue]
}

export default useLocalStorage