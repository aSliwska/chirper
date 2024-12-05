"use client";

import PostList from "@/components/PostList";
import ProfilePicture from "@/components/ProfilePicture";
import { DbConnector } from "@/logic/DbConnector";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export default function Dashboard() {
    const [user, _] = useState(JSON.parse(localStorage.getItem('user')));
    const [posts, setPosts] = useState([]);
    const [draftText, setDraftText] = useState("");
    const textbox = useRef(null);

    const adjustHeight = useCallback((e) => {
        textbox.current.style.height = "inherit";
        textbox.current.style.height = `${textbox.current.scrollHeight}px`;
    }, [textbox]);

    const changeDraftText = useCallback((e) => {
        setDraftText(e.target.value);
        adjustHeight();
    }, []);

    const post = useCallback(() => {
        async function makePost() {
            const { postId, when } = await DbConnector.getInstance().createPost(user.id, draftText);
            setPosts([
                {
                    posterId: user.id,
                    posterName: user.name,
                    posterAvatarColor: user.avatar_color,
                    likes: 0,
                    didUserLike: false,
                    when: when,
                    postId: postId,
                    commentNumber: 0,
                    text: draftText
                },
                ...posts
            ]);
        }
        makePost();
    }, [user, draftText]);

    useLayoutEffect(adjustHeight, []);

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
            <div className="border-b border-secondary flex flex-row p-4 gap-4 bg-primary-darker">
                <Link href={`/profile/${user.id}`} className="h-fit">
                    <ProfilePicture size={48} color={user.avatar_color}/>
                </Link>
                <div className="flex flex-col gap-4 w-full h-full">
                    <textarea
                        className="text-tertiary placeholder:text-[#9c86b1] bg-primary-darker p-2 w-full h-full min-h-[50px] resize-none"
                        ref={textbox}
                        type="text" 
                        placeholder={"What's on your mind?"} 
                        value={draftText}
                        onChange={changeDraftText}
                    />
                    <div 
                        className="button text-white px-4 py-3 rounded-md font-bold w-fit self-end text-wrap"
                        onClick={post}
                    >
                        Post
                    </div>
                </div>
            </div>

            <PostList posts={posts}/>
        </>
    );
}