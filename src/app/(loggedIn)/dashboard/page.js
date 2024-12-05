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
                const feed = await DbConnector.getInstance().getFeed(user.id);
                setPosts(feed);
            }
        }
        getPosts();
    }, [user]);
    
    return(
        <>
            <div>
                {/* input post field */}
            </div>

            <PostList posts={posts}/>
        </>
    );
}