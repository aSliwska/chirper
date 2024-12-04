import neo4j from 'neo4j-driver';
import { dbURL, dbUser, dbPassword } from "@/store/secrets";

export async function connect() {  
    try {
      const driver = neo4j.driver(dbURL, neo4j.auth.basic(dbUser, dbPassword));
      const serverInfo = await driver.getServerInfo();
      console.log('Connection established');
      console.log(serverInfo);
    } 
    catch(err) {
      console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    }
  }