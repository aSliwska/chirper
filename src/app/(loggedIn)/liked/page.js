"use client";

import PostList from "@/components/PostList";
import { DbConnector } from "@/logic/DbConnector";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
    }, []);

    useEffect(() => {
        async function getPosts() {
            if (user !== null) {
                const liked = await DbConnector.getInstance().getLikedPosts(user.id);
                setPosts(liked);
            }
        }
        getPosts();
    }, [user]);
    
    return(
        <PostList posts={posts} user={user}/>
    );
}