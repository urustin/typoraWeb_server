// functions/headerFx.js

const endpoint = process.env.REACT_APP_ENDPOINT;

const checkLogin2 = async () => {
    const sessionID = sessionStorage.getItem("sessionID");
    const response = await fetch(`${endpoint}/auth/check-auth`,{
      method : "GET",
      credentials : "include",
      headers:{
        'Content-Type': 'application/json',
        "x-session-id": sessionID,
      }
    });
    if(response.ok){
      const data = await response.json();
      return data;
    }
};

export default checkLogin2;