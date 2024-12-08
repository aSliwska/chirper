"use client";

import { DbConnector } from "@/logic/DbConnector";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Postt } from "@/components/PostList";

export default function Post() {
    const [user, _] = useState(JSON.parse(localStorage.getItem('user')));
    const path = usePathname();
    const [post, setPost] = useState(undefined);
    const [comments, setComments] = useState(undefined);

    useEffect(() => {
        async function getPost() {
            const id = Number(path.substring(path.lastIndexOf('/') + 1));
            const result = await DbConnector.getInstance().getPost(id, user.id);
            setPost(result);
        }
        getPost();
    }, [path, user]);

    useEffect(() => {
        async function getComments() {
            if (post !== undefined) {
                const result = await DbConnector.getInstance().getComments(post.postId, user.id);
                const sorted = [];

                for (let i = result.length - 1; i >= 0; i -= 1) {
                    if (result[i].parentId === null) {
                        sorted.push({
                            ...result[i],
                            recursionLevel: 0,
                        });
                    }
                    else {
                        const parentIndex = sorted.findIndex((comment) => { return comment.commentId === result[i].parentId});
                        const parentRecursionLevel = sorted[parentIndex].recursionLevel;
                        sorted.splice(parentIndex, 0, {
                            ...result[i],
                            recursionLevel: parentRecursionLevel + 1,
                        });
                    }
                }

                sorted.reverse();
                
                setComments(sorted);
                console.log(sorted);
            }
        }
        getComments();
    }, [post]);

    return (
        <>
            {post && <div className="border-b border-secondary"><Postt post={post} user={user} isClickable={false}/></div>}
            {comments && <ul className="flex flex-col w-full">
                {comments.map((comment, index) => 
                    <li className="border-b border-secondary" style={{ paddingLeft: (comment.recursionLevel + 1) * 48 }} key={index}>
                        <Postt post={comment} user={user} isClickable={false}/>
                    </li>
                )}
            </ul>}
        </>
    ); 
}