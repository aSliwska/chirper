"use client";

import FollowButton from "@/components/FollowButton";
import PostList from "@/components/PostList";
import ProfilePicture from "@/components/ProfilePicture";
import { DbConnector } from "@/logic/DbConnector";
import dayjs from "dayjs";
import { redirect, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Profile() {
    const [user, setUser] = useState(null);
    const path = usePathname();
    const [profileOwner, setProfileOwner] = useState(undefined);
    const [isUserFollowing, setIsUserFollowing] = useState(false);
    const [posts, setPosts] = useState(undefined);

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
    }, []);

    useEffect(() => {
        async function getPerson() {
            const id = Number(path.substring(path.lastIndexOf('/') + 1));
            if (user.id === id) {
                setProfileOwner(user);
            } 
            else {
                const result = await DbConnector.getInstance().getProfile(id, user.id);
                setProfileOwner({
                    id: result.id,
                    avatar_color: result.avatar_color,
                    name: result.name,
                    when_joined: result.when_joined, 
                });
                setIsUserFollowing(result.isUserFollowing);
            }
        }
        getPerson();
    }, [user, path]);

    useEffect(() => {
        async function getPosts() {
            if (profileOwner !== undefined) {
                const result =  await DbConnector.getInstance().getProfilePosts(profileOwner, user.id);
                setPosts(result);
            }
        }
        getPosts();
    }, [profileOwner]);

    const onClickLogout = useCallback(() => {
        localStorage.setItem('user', null);
        redirect('/');
    }, []);

    return (
        <>
            <div className="flex flex-col gap-4 border-b border-secondary p-4">
                {(profileOwner && user) && <>
                    <ProfilePicture size={128} color={profileOwner.avatar_color}/>
                    <span className="font-bold text-xl">{profileOwner.name}</span>
                    <span className="text-secondary">Joined: {dayjs(profileOwner.when_joined).format('DD/MM/YYYY')}</span>
                    <div className="flex gap-4">
                        {(user.id === profileOwner.id) ? 
                        <>
                            <button 
                                className="button text-white p-3 rounded-md font-bold"
                                onClick={onClickLogout}
                            >Logout</button>
                        </>
                        :
                        <FollowButton personId={profileOwner.id} isUserFollowing={isUserFollowing} userId={user.id} />
                        }
                    </div>
                </>}
            </div>
            {posts && <PostList posts={posts} user={user}/>}
        </>
        
    );
}