// functions/headerFx.js

const endpoint = process.env.REACT_APP_ENDPOINT;

const checkLogin = async (e) => {
    e.preventDefault();
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
      alert("login= "+data.isAuthenticated);
    }
};

export default checkLogin;