import Link from "next/link";
import ProfilePicture from "./ProfilePicture";
import { useCallback, useState } from "react";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import { HeartFilled, HeartOutlined, MessageOutlined } from "@ant-design/icons";
import { DbConnector } from "@/logic/DbConnector";


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
    const [userFollows, setUserFollows] = useState(person.isUserFollowing);

    const onClickPerson = useCallback(() => {
        redirect(`/profile/${person.id}`);
    }, [person]);

    const onClickFollow = useCallback((e) => {
        async function follow() {
            const nowFollows = !userFollows;
            
            if (nowFollows) {
                await DbConnector.getInstance().follow(user.id, person.id);
            }
            else {
                await DbConnector.getInstance().unfollow(user.id, person.id);
            }
            
            setUserFollows(nowFollows);
        }
        e.stopPropagation();
        follow();
    }, [userFollows, user, person]);

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
                <button 
                    className="button text-white p-3 rounded-md font-bold flex justify-center min-w-24"
                    onClick={onClickFollow}
                >
                    {userFollows ? 'Unfollow' : 'Follow'}
                </button>
            </div>
        </li>
    );
}