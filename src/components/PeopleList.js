import Link from "next/link";
import ProfilePicture from "./ProfilePicture";
import { useCallback, useState } from "react";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import { HeartFilled, HeartOutlined, MessageOutlined } from "@ant-design/icons";
import { DbConnector } from "@/logic/DbConnector";
import FollowButton from "./FollowButton";


export default function PeopleList({ people, user }) {
    return (
        <ul>
            {people.map((person, index) => <Person person={person} user={user} key={index}/>)}
        </ul>
    );
}

/*{
    id,
    name,
    avatar_color,
    isUserFollowing,
}*/
function Person({ person, user }) {
    const onClickPerson = useCallback(() => {
        redirect(`/profile/${person.id}`);
    }, [person]);

    return (
        <li>
            <div 
                className="button-panel border-b border-secondary flex flex-row p-4 justify-between w-full"
                onClick={onClickPerson}
            >
                
                <div className="flex flex-row gap-4 items-center">
                    <ProfilePicture size={48} color={person.avatar_color}/>
                    <span className="font-bold">{person.name}</span>
                </div>
                <FollowButton personId={person.id} isUserFollowing={person.isUserFollowing} userId={user.id} />
            </div>
        </li>
    );
}