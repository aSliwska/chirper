import neo4j, { Integer } from 'neo4j-driver';
import { dbURL, dbUser, dbPassword } from "@/store/secrets";
import dayjs from 'dayjs';


export class DbConnector {
  static #instance;
  #driver;

  static getInstance() {
    if ((this.#instance === undefined) || (this.#instance === null)) {
      this.#instance = new DbConnector();
      this.#instance.#connect();
    }
    return this.#instance;
  }

  #connect() {  
    try {
      this.#driver = neo4j.driver(dbURL, neo4j.auth.basic(dbUser, dbPassword));
    } 
    catch(err) {
      console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    }
  }

  async getUserFromDb(username, password) {
    if (this.#driver === null) {
      this.#connect();
    }

    const { records, summary, keys } = await this.#driver.executeQuery(
      'MATCH (p:person {name: $name, password: $password}) RETURN p.id AS id, p.when_joined AS when_joined, p.avatar_color AS avatar_color',
      { name: username, password: password },
      { database: 'neo4j' }
    );

    if (records.length !== 1) {
      return null;
    }

    return { 
      name: username, 
      id: this.#toNumber(records[0].get('id')), 
      when_joined: records[0].get('when_joined').toStandardDate(), 
      avatar_color: records[0].get('avatar_color') 
    };
  }

  async createNewUser(username, password) {
    if (this.#driver === null) {
      this.#connect();
    }

    const avatar_color = '#' + Math.floor(Math.random()*16777215).toString(16);
    const date = new Date();
    const when_joined = dayjs(date).toJSON(); 

    const { records, _, __ } = await this.#driver.executeQuery(
      'MATCH (p:person) RETURN max(p.id) AS max_id',
      { },
      { database: 'neo4j' }
    );

    const idNumber = this.#toNumber(records[0].get('max_id')) + 1;
    const id = new Integer(idNumber);

    await this.#driver.executeQuery(
      'CREATE (p:person {name: $name, password: $password, when_joined: datetime($when_joined), avatar_color: $avatar_color, id: $id})',
      { name: username, password: password, when_joined: when_joined, avatar_color: avatar_color, id: id },
      { database: 'neo4j' }
    );

    return { name: username, when_joined: date, avatar_color: avatar_color, id: idNumber };
  }

  async getFeed(userId) {
    if (this.#driver === null) {
      this.#connect();
    }

    const { records, _, __ } = await this.#driver.executeQuery(
      'MATCH (:person {id: 3})-[:FOLLOWS]->(f:person) WITH f MATCH (f)-[posted:POSTED]->(p:post) WITH f,posted,p OPTIONAL MATCH (p)<-[l:LIKES]-(:person) RETURN f.id AS posterId, f.name AS posterName, f.avatar_color AS posterAvatarColor, count(l) AS likes, posted.when AS when, p.id AS postId, p.text AS text ORDER BY posted.when DESC',
      { id: userId },
      { database: 'neo4j' } 
    );

    return records.map(r => { return {
      posterId: this.#toNumber(r.get('posterId')),
      posterName: r.get('posterName'),
      posterAvatarColor: r.get('posterAvatarColor'),
      likes: this.#toNumber(r.get('likes')),
      when: r.get('when').toStandardDate(),
      postId: this.#toNumber(r.get('postId')),
      text: r.get('text')
    }});
  }

  #toNumber({ low, high }) {
    let res = high;
  
    for (let i = 0; i < 32; i++) {
      res *= 2;
    }
  
    return low + res;
  }
}
 