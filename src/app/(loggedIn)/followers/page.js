"use client";

import PeopleList from "@/components/PeopleList";
import { DbConnector } from "@/logic/DbConnector";
import { useEffect, useState } from "react";

export default function Followers() {
    const [user, setUser] = useState(null);
    const [followers, setFollowers] = useState([]);

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
    }, []);

    useEffect(() => {
        async function getPeople() {
            if (user !== null) {
                const people = await DbConnector.getInstance().getFollowers(user.id);
                setFollowers(people);
            }
        }
        getPeople();
    }, [user]);
    
    return(
        <PeopleList people={followers} user={user}/>
    );
}