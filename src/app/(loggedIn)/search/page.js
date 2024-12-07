"use client";

import PeopleList from "@/components/PeopleList";
import { DbConnector } from "@/logic/DbConnector";
import { queryAtom } from "@/store/globals";
import { useAtomValue } from "jotai";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchPage() {
    const [user, _] = useState(JSON.parse(localStorage.getItem('user')));
    const query = useAtomValue(queryAtom);
    const [foundPeople, setFoundPeople] = useState([]);

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