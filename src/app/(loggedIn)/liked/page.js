"use client";

import PostList from "@/components/PostList";
import { DbConnector } from "@/logic/DbConnector";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [user, _] = useState(JSON.parse(localStorage.getItem('user')));
    const [posts, setPosts] = useState([]);

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
        <PostList posts={posts}/>
    );
}