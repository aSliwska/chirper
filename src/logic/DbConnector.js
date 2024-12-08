import neo4j, { DateTime, Integer } from 'neo4j-driver';
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

    if ((username.length == 0) || (password.length == 0)) {
      return null;
    }

    const { records } = await this.#driver.executeQuery(
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

    if ((username.length == 0) || (password.length == 0)) {
      return null;
    }

    const { records: records2 } = await this.#driver.executeQuery(
      'MATCH (p:person { name: $name }) RETURN p.id AS id',
      { name: username },
      { database: 'neo4j' }
    );

    if (records2.length !== 0) {
      return null;
    }

    const avatar_color = '#' + Math.floor(Math.random()*16777215).toString(16);
    const date = new Date();
    const when_joined = DateTime.fromStandardDate(date); 

    const { records } = await this.#driver.executeQuery(
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

    const { records } = await this.#driver.executeQuery(
      'MATCH (:person {id: $id})-[:FOLLOWS]->(per:person) WITH per MATCH (f:person)-[posted:POSTED]->(p:post) WHERE (f.id = per.id) OR \
      (f.id = $id) WITH f,posted,p OPTIONAL MATCH (p)<-[:LIKES]-(l:person) RETURN f.id AS posterId, f.name AS posterName, f.avatar_color \
      AS posterAvatarColor, count(DISTINCT l.id) AS likes, $id IN collect(DISTINCT l.id) AS didUserLike, posted.when AS when, p.id AS \
      postId, COUNT { MATCH (p)<-[:REPLY_TO]-(r:comment) WITH r MATCH (r)<-[:REPLY_TO *0..]-(rr:comment) RETURN rr } AS commentNumber, \
      p.text AS text ORDER BY posted.when DESC',
      { id: userId },
      { database: 'neo4j' } 
    );

    return records.map(r => { return {
      posterId: this.#toNumber(r.get('posterId')),
      posterName: r.get('posterName'),
      posterAvatarColor: r.get('posterAvatarColor'),
      likes: this.#toNumber(r.get('likes')),
      didUserLike: r.get('didUserLike') ?? false,
      when: r.get('when').toStandardDate(),
      postId: this.#toNumber(r.get('postId')),
      commentNumber: this.#toNumber(r.get('commentNumber')),
      text: r.get('text')
    }});
  }

  async getLikedPosts(userId) {
    if (this.#driver === null) {
      this.#connect();
    }

    const { records } = await this.#driver.executeQuery(
      'MATCH (:person {id: $id})-[:LIKES]->(p:post) WITH p MATCH (p)<-[posted:POSTED]-(f:person) WITH f,posted,p OPTIONAL MATCH \
      (p)<-[:LIKES]-(l:person) RETURN f.id AS posterId, f.name AS posterName, f.avatar_color AS posterAvatarColor, count(DISTINCT l.id) \
      AS likes, posted.when AS when, p.id AS postId, COUNT { MATCH (p)<-[:REPLY_TO]-(r:comment) WITH r MATCH \
      (r)<-[:REPLY_TO *0..]-(rr:comment) return rr } AS commentNumber, p.text AS text ORDER BY posted.when DESC',
      { id: userId },
      { database: 'neo4j' } 
    );

    return records.map(r => { return {
      posterId: this.#toNumber(r.get('posterId')),
      posterName: r.get('posterName'),
      posterAvatarColor: r.get('posterAvatarColor'),
      likes: this.#toNumber(r.get('likes')),
      didUserLike: true,
      when: r.get('when').toStandardDate(),
      postId: this.#toNumber(r.get('postId')),
      commentNumber: this.#toNumber(r.get('commentNumber')),
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

  async likePost(userId, postId, isComment) {
    const type = isComment ? 'comment' : 'post';

    if (this.#driver === null) {
      this.#connect();
    }

    await this.#driver.executeQuery(
      `MATCH (p:person {id: $userId}), (r:${type} {id: $postId}) MERGE (p)-[:LIKES]->(r)`,
      { userId: userId, postId: postId },
      { database: 'neo4j' } 
    );
  }

  async dislikePost(userId, postId, isComment) {
    const type = isComment ? 'comment' : 'post';

    if (this.#driver === null) {
      this.#connect();
    }

    await this.#driver.executeQuery(
      `MATCH (:person {id: $userId})-[r:LIKES]->(:${type} {id: $postId}) DELETE r`,
      { userId: userId, postId: postId },
      { database: 'neo4j' } 
    );
  }

  async createPost(userId, text) {
    if (this.#driver === null) {
      this.#connect();
    }

    const { records } = await this.#driver.executeQuery(
      'MATCH (p:post) RETURN max(p.id) AS max_id',
      { },
      { database: 'neo4j' }
    );

    const when = new Date();
    const when_posted = DateTime.fromStandardDate(when); 

    const idNumber = this.#toNumber(records[0].get('max_id')) + 1;
    const id = new Integer(idNumber);

    await this.#driver.executeQuery(
      'CREATE (p:post {id: $postId, text: $text}) WITH p MATCH (u:person {id: $userId}) MERGE (u)-[:POSTED {when: $when}]->(p)',
      { postId: id, text: text, when: when_posted, userId: userId },
      { database: 'neo4j' }
    );

    return { postId: idNumber, when: when };
  }

  async getPeopleUserFollows(userId) {
    if (this.#driver === null) {
      this.#connect();
    }

    const { records } = await this.#driver.executeQuery(
      'MATCH (:person {id: $userId})-[:FOLLOWS]->(f:person) RETURN f.id as id, f.avatar_color as avatar_color, f.name as name',
      { userId: userId },
      { database: 'neo4j' } 
    );

    return records.map(r => { return {
      id: this.#toNumber(r.get('id')),
      avatar_color: r.get('avatar_color'),
      name: r.get('name'),
      isUserFollowing: true,
    }});
  }

  async getFollowers(userId) {
    if (this.#driver === null) {
      this.#connect();
    }

    const { records } = await this.#driver.executeQuery(
      'MATCH (:person {id: $userId})<-[:FOLLOWS]-(f:person) RETURN f.id as id, f.avatar_color as avatar_color, f.name as name, ' +
      '$userId IN COLLECT { MATCH (follower:person)-[:FOLLOWS]->(f) RETURN follower.id } AS isUserFollowing',
      { userId: userId },
      { database: 'neo4j' } 
    );

    return records.map(r => { return {
      id: this.#toNumber(r.get('id')),
      avatar_color: r.get('avatar_color'),
      name: r.get('name'),
      isUserFollowing: r.get('isUserFollowing') ?? false,
    }});
  }

  async follow(userId, personId) {
    if (this.#driver === null) {
      this.#connect();
    }

    await this.#driver.executeQuery(
      'MATCH (u:person {id: $userId}), (p:person {id: $personId}) MERGE (u)-[:FOLLOWS]->(p)',
      { userId: userId, personId: personId },
      { database: 'neo4j' } 
    );
  }

  async unfollow(userId, personId) {
    if (this.#driver === null) {
      this.#connect();
    }

    await this.#driver.executeQuery(
      'MATCH (:person {id: $userId})-[r:FOLLOWS]->(:person {id: $personId}) DELETE r',
      { userId: userId, personId: personId },
      { database: 'neo4j' } 
    );
  }

  async getPeopleSearchResult(query, userId) {
    if (this.#driver === null) {
      this.#connect();
    }

    const { records } = await this.#driver.executeQuery(
      'MATCH (f:person) WHERE (lower(f.name) CONTAINS lower($query)) AND (f.id <> $userId) RETURN f.id as id, f.avatar_color \
      as avatar_color, f.name as name, $userId IN COLLECT { MATCH (follower:person)-[:FOLLOWS]->(f) RETURN follower.id } AS isUserFollowing',
      { query: query, userId: userId },
      { database: 'neo4j' } 
    );

    return records.map(r => { return {
      id: this.#toNumber(r.get('id')),
      avatar_color: r.get('avatar_color'),
      name: r.get('name'),
      isUserFollowing: r.get('isUserFollowing') ?? false,
    }});
  }

  async getProfile(id, userId) {
    if (this.#driver === null) {
      this.#connect();
    }

    const { records } = await this.#driver.executeQuery(
      'MATCH (f:person {id: $id}) RETURN f.id as id, f.avatar_color as avatar_color, f.name as name, f.when_joined AS when_joined, \
      $userId IN COLLECT { MATCH (follower:person)-[:FOLLOWS]->(f) RETURN follower.id } AS isUserFollowing',
      { id: id, userId: userId },
      { database: 'neo4j' } 
    );

    return {
      id: id,
      avatar_color: records[0].get('avatar_color'),
      name: records[0].get('name'),
      when_joined: records[0].get('when_joined').toStandardDate(), 
      isUserFollowing: records[0].get('isUserFollowing') ?? false,
    };
  }

  async getProfilePosts(profileOwner, userId) {
    if (this.#driver === null) {
      this.#connect();
    }

    const { records } = await this.#driver.executeQuery(
      'MATCH (f:person {id: $id})-[posted:POSTED]->(p:post) WITH f,posted,p OPTIONAL MATCH (p)<-[:LIKES]-(l:person) RETURN \
      count(DISTINCT l.id) AS likes, $userId IN collect(DISTINCT l.id) AS didUserLike, posted.when AS when, p.id AS postId, \
      COUNT { MATCH (p)<-[:REPLY_TO]-(r:comment) WITH r MATCH (r)<-[:REPLY_TO *0..]-(rr:comment) RETURN rr } AS commentNumber, \
      p.text AS text ORDER BY posted.when DESC',
      { userId: userId, id: profileOwner.id },
      { database: 'neo4j' } 
    );

    return records.map(r => { return {
      posterId: profileOwner.id,
      posterName: profileOwner.name,
      posterAvatarColor: profileOwner.avatar_color,
      likes: this.#toNumber(r.get('likes')),
      didUserLike: r.get('didUserLike') ?? false,
      when: r.get('when').toStandardDate(),
      postId: this.#toNumber(r.get('postId')),
      commentNumber: this.#toNumber(r.get('commentNumber')),
      text: r.get('text')
    }});
  }

  async getPost(id, userId) {
    if (this.#driver === null) {
      this.#connect();
    }

    const { records } = await this.#driver.executeQuery(
      'MATCH (f:person)-[posted:POSTED]->(p:post {id: $id}) WITH f,posted,p OPTIONAL MATCH (p)<-[:LIKES]-(l:person) RETURN f.id AS posterId, \
      f.name AS posterName, f.avatar_color AS posterAvatarColor, count(DISTINCT l.id) AS likes, $userId IN collect(DISTINCT l.id) AS \
      didUserLike, posted.when AS when, COUNT { MATCH (p)<-[:REPLY_TO]-(r:comment) WITH r MATCH (r)<-[:REPLY_TO *0..]-(rr:comment) \
      RETURN rr } AS commentNumber, p.text AS text ORDER BY posted.when DESC',
      { id: id, userId: userId },
      { database: 'neo4j' } 
    );

    return {
      posterId: this.#toNumber(records[0].get('posterId')),
      posterName: records[0].get('posterName'),
      posterAvatarColor: records[0].get('posterAvatarColor'),
      likes: this.#toNumber(records[0].get('likes')),
      didUserLike: records[0].get('didUserLike') ?? false,
      when: records[0].get('when').toStandardDate(),
      postId: id,
      commentNumber: this.#toNumber(records[0].get('commentNumber')),
      text: records[0].get('text')
    };
  }

  async getComments(postId, userId) {
    if (this.#driver === null) {
      this.#connect();
    }

    const { records } = await this.#driver.executeQuery(
      'MATCH (:post {id: $postId})<-[:REPLY_TO]-(c:comment)<-[:REPLY_TO *0..]-(cc:comment)<-[commented:COMMENTED]-(f:person) \
      WITH cc,c,f,commented OPTIONAL MATCH (cc)<-[:LIKES]-(l:person) RETURN cc.id AS commentId, c.id AS parentId, f.id AS posterId, \
      f.name AS posterName, f.avatar_color AS posterAvatarColor, count(DISTINCT l.id) AS likes, $userId IN collect(DISTINCT l.id) \
      AS didUserLike, commented.when AS when, COUNT { MATCH (cc)<-[:REPLY_TO *1..]-(r:comment) RETURN r } AS commentNumber, cc.text \
      AS text ORDER BY commented.when DESC',
      { postId: postId, userId: userId },
      { database: 'neo4j' } 
    );

    return records.map(r => { 
      const commentId = this.#toNumber(r.get('commentId'));
      const parentId = this.#toNumber(r.get('parentId'));
      return {
        commentId: commentId,
        parentId: (commentId === parentId) ? null : parentId,
        posterId: this.#toNumber(r.get('posterId')),
        posterName: r.get('posterName'),
        posterAvatarColor: r.get('posterAvatarColor'),
        likes: this.#toNumber(r.get('likes')),
        didUserLike: r.get('didUserLike') ?? false,
        when: r.get('when').toStandardDate(),
        postId: postId,
        commentNumber: this.#toNumber(r.get('commentNumber')),
        text: r.get('text')
      }
    });

  }
}
 