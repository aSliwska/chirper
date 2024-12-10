"use client";

import { DbConnector } from "@/logic/DbConnector";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import ProfilePicture from "@/components/ProfilePicture";
import { Postt } from "@/components/PostList";
import dayjs from "dayjs";
import { HeartFilled, HeartOutlined, MessageOutlined } from "@ant-design/icons";
import { useAtom, useAtomValue } from "jotai";
import { causeUpdateAtom } from "@/store/globals";

export default function Post() {
    const causeUpdate = useAtomValue(causeUpdateAtom);
    const [user, setUser] = useState(null);
    const path = usePathname();
    const [post, setPost] = useState(undefined);
    const [comments, setComments] = useState(undefined);

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
    }, []);

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
            }
        }
        getComments();
    }, [post]);

    useEffect(() => {
        const temp = comments;
        setComments([]);
        setComments(comments);
    }, [causeUpdate, comments]);

    return (
        <>
            {post && 
                <>
                    <div className="border-b border-secondary"><Postt post={post} user={user} isClickable={false}/></div>
                    <WriteCommentField user={user} setComments={setComments} comments={comments} index={0} parentId={post.postId} postId={post.postId} parentRecursionLevel={-1}/>
                </>
            }
            {comments && 
                <ul className="flex flex-col w-full">
                    {comments.map((comment, index) => 
                        <li key={'' + index + comment.commentId}>
                            <Commentt comment={comment} user={user} index={index} setComments={setComments} comments={comments}/>
                        </li>
                    )}
                </ul>
            }
        </>
    ); 
}

function Commentt({ comment, user, index, setComments, comments }) {
    const [replyFieldVisible, setReplyFieldVisible] = useState(false);
    const [userLiked, setUserLiked] = useState(comment.didUserLike);
    const [likes, setLikes] = useState(comment.likes);

    const onClickLike = useCallback((e) => {
        async function like() {
            const nowLikes = !userLiked;
            if (nowLikes) {
                await DbConnector.getInstance().likePost(user.id, comment.commentId, true);
                setLikes(likes + 1);
            }
            else {
                await DbConnector.getInstance().dislikePost(user.id, comment.commentId, true);
                setLikes(likes - 1);
            }
            
            setUserLiked(nowLikes);
        }
        e.stopPropagation();
        like();
    }, [userLiked, likes, user, comment]);

    return (
        <div className="flex flex-col w-full">
            <div className="border-b border-secondary" style={{ paddingLeft: (comment.recursionLevel + 1) * 48 }}>
                <div className={"flex flex-row p-4 gap-4 "}>
                    <Link href={`/profile/${comment.posterId}`} className="h-fit">
                        <ProfilePicture size={48} color={comment.posterAvatarColor}/>
                    </Link>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-row gap-4">
                            <Link href={`/profile/${comment.posterId}`} className="font-bold">
                                {comment.posterName}
                            </Link>
                            <span className="text-secondary">{dayjs(comment.when).format('HH:mm • DD/MM/YYYY')}</span>
                        </div>
                        <span>{comment.text}</span>
                        <div className="flex justify-around">
                            <div className="flex items-center gap-2">
                                {(userLiked) ? 
                                    <HeartFilled style={{ fontSize: 24, color: '#9c86b1' }} onClick={onClickLike}/> 
                                :
                                    <HeartOutlined style={{ fontSize: 24, color: '#9c86b1' }} onClick={onClickLike}/> 
                                }
                                <span className="text-secondary">{likes}</span> 
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageOutlined style={{ fontSize: 24, color: '#9c86b1' }} onClick={() => setReplyFieldVisible(!replyFieldVisible)}/>
                                <span className="text-secondary">{comment.commentNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {replyFieldVisible && <WriteCommentField user={user} setComments={setComments} comments={comments} index={index + 1} parentId={comment.commentId} postId={comment.postId} parentRecursionLevel={comment.recursionLevel} setReplyFieldVisible={setReplyFieldVisible}/>}
        </div>
    );
}

function WriteCommentField({ user, setComments, comments, index, parentId, postId, parentRecursionLevel, setReplyFieldVisible }) {
    const [causeUpdate, setCauseUpdate] = useAtom(causeUpdateAtom);
    const [draftText, setDraftText] = useState("");
    const textbox = useRef(null);

    const adjustHeight = useCallback(() => {
        textbox.current.style.height = "inherit";
        textbox.current.style.height = `${textbox.current.scrollHeight}px`;
    }, [textbox]);

    const changeDraftText = useCallback((e) => {
        setDraftText(e.target.value);
        adjustHeight();
    }, []);

    const comment = useCallback(() => {
        async function makeComment() {
            const isParentAPost = (parentId === postId);
            const { commentId, when } = await DbConnector.getInstance().createComment(user.id, draftText, parentId, isParentAPost);
            setComments([
                ...comments.slice(0, index),
                {
                    commentId: commentId,
                    parentId: isParentAPost ? null : parentId,
                    posterId: user.id,
                    posterName: user.name,
                    posterAvatarColor: user.avatar_color,
                    likes: 0,
                    didUserLike: false,
                    when: when,
                    postId: postId,
                    commentNumber: 0,
                    text: draftText,
                    recursionLevel: parentRecursionLevel + 1,
                },
                ...comments.slice(index)
            ]);
            setReplyFieldVisible(false);
            setCauseUpdate(!causeUpdate);
        }
        makeComment();
    }, [user, draftText, comments, causeUpdate]);


    useLayoutEffect(adjustHeight, []);

    return (
        <div className="border-b border-secondary flex flex-row p-4 gap-4 bg-primary-darker">
            {user &&
                <Link href={`/profile/${user.id}`} className="h-fit">
                    <ProfilePicture size={48} color={user.avatar_color}/>
                </Link>
            }
            <div className="flex gap-4 w-full h-full">
                <textarea
                    className="text-tertiary placeholder:text-[#9c86b1] bg-primary-darker p-2 w-full h-full min-h-[50px] resize-none"
                    ref={textbox}
                    type="text" 
                    placeholder={"Write a reply..."} 
                    value={draftText}
                    onChange={changeDraftText}
                />
                <div 
                    className="button text-white px-4 py-3 rounded-md font-bold w-fit self-end text-wrap"
                    onClick={comment}
                >
                    Reply
                </div>
            </div>
        </div>
    );
}