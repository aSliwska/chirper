"use client";

import { SearchOutlined } from "@ant-design/icons";
import { useCallback, useState } from "react";


export default function Search() {
    const [query, setQuery] = useState("");

    const changeQuery = useCallback((e) => {
        setQuery(e.target.value);
    }, []);

    return (
        <div className="p-4 w-full">
            <div className="w-full rounded-md border border-secondary pl-2 bg-primary-darker items-center flex">
                <SearchOutlined style={{ fontSize: 24, color: '#9c86b1' }}/>
                <input 
                    type="text" 
                    placeholder={'Search people'} 
                    value={query} 
                    onChange={changeQuery}
                    className="text-tertiary placeholder:text-[#9c86b1] bg-primary-darker p-2 w-full rounded-md"
                />
            </div>
        </div>
    );
}