"use client";

import PeopleList from "@/components/PeopleList";
import { DbConnector } from "@/logic/DbConnector";
import { useEffect, useState } from "react";

export default function Following() {
    const [user, _] = useState(JSON.parse(localStorage.getItem('user')));
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        async function getPeople() {
            if (user !== null) {
                const people = await DbConnector.getInstance().getPeopleUserFollows(user.id);
                setFollowing(people);
            }
        }
        getPeople();
    }, [user]);
    
    return(
        <PeopleList people={following} user={user}/>
    );
}