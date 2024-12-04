"use client";

import { UserOutlined } from "@ant-design/icons";
import { useState } from "react";

export default function ProfilePicture({ size }) {
    const [user, _] = useState(JSON.parse(localStorage.getItem('user')));

    return (
        <div 
            className={`flex rounded-full border-white border items-center justify-center`}
            style={{ width: size, height: size, backgroundColor: user.avatar_color }}
        >
            <UserOutlined style={{ fontSize: '24px', color: 'white' }}/>
        </div>
    );
}