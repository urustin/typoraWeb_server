// ensureAuthenticated.js
// Redis
import { createClient } from 'redis';

const redisClient = createClient({
  url: 'redis://localhost:6379',
});
redisClient.connect().catch(console.error);


async function ensureAuthenticated(req, res, next) {
    const sessionId = req.headers['x-session-id'];
    console.log("ISAUTHEN Session:", sessionId);
    console.log("Checking authentication...");
  
    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID provided' });
    }
  
    const redisKey = `sess:${sessionId}`;
    console.log(redisKey);
    try {
      const sessionData = await redisClient.get(redisKey);
      console.log("세션:!"+sessionData);
      if (!sessionData) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      const sessionObj = JSON.parse(sessionData);
      if (sessionObj.passport && sessionObj.passport.user) {
        req.user = sessionObj.passport.user;
        req.sessionID = sessionId; // Update the sessionID in the request
        console.log("ensure 통과");
        return next();
      } else {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    } catch (error) {
      console.error('Error accessing Redis:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default ensureAuthenticated;