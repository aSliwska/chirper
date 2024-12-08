"use client";

import { useCallback, useState } from "react";
import { DbConnector } from "@/logic/DbConnector";

export default function FollowButton({ personId, isUserFollowing, userId }) {
    const [userFollows, setUserFollows] = useState(isUserFollowing);

    const onClickFollow = useCallback((e) => {
        async function follow() {
            const nowFollows = !userFollows;
            
            if (nowFollows) {
                await DbConnector.getInstance().follow(userId, personId);
            }
            else {
                await DbConnector.getInstance().unfollow(userId, personId);
            }
            
            setUserFollows(nowFollows);
        }
        e.stopPropagation();
        follow();
    }, [userFollows, userId, personId]);

    return (
        <button 
            className="button text-white p-3 rounded-md font-bold flex justify-center min-w-24"
            onClick={onClickFollow}
        >
            {userFollows ? 'Unfollow' : 'Follow'}
        </button>
    );
}