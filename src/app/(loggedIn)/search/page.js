"use client";

import PeopleList from "@/components/PeopleList";
import { DbConnector } from "@/logic/DbConnector";
import { queryAtom } from "@/store/globals";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

export default function SearchPage() {
    const [user, setUser] = useState(null);
    const query = useAtomValue(queryAtom);
    const [foundPeople, setFoundPeople] = useState([]);

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
    }, []);

    useEffect(() => {
        async function getPeople() {
            if (user !== null) {
                const people = await DbConnector.getInstance().getPeopleSearchResult(query, user.id);
                setFoundPeople(people);
            }
        }
        getPeople();
    }, [user, query]);
    
    return(
        <PeopleList people={foundPeople} user={user}/>
    );
}