"use client";

import { HeartFilled, HomeFilled, PushpinFilled, SmileFilled } from "@ant-design/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProfilePicture from "./ProfilePicture";
import ChirperLogo from "./ChirperLogo";

export default function SideMenu() { 
    // useEffect(() => {
    //     localStorage.setItem('user', JSON.stringify({id:2,when_joined:'24/02/2024',avatar_color:'#487edb',name:'bookworrm'}))
    // },[]);
    const [user, _] = useState(JSON.parse(localStorage.getItem('user')));
    
    return (
        <div className="flex flex-col pe-6 fixed">
            <div className="self-center mb-1 p-6">
                <ChirperLogo/>
            </div>

            <MenuButton link={'/dashboard'} icon={<HomeFilled/>} text={'Dashboard'}/>
            <MenuButton link={'/liked'} icon={<HeartFilled/>} text={'Liked posts'}/>
            <MenuButton link={'/following'} icon={<PushpinFilled/>} text={'People you follow'}/>
            <MenuButton link={'/followers'} icon={<SmileFilled/>} text={'People who follow you'}/>

            <div className="mt-4">
                <MenuButton link={'/profile'} icon={<ProfilePicture size={48}/>} text={user.name}/>
            </div>
        </div>
    );
}

function MenuButton({ link, icon, text }) {
    return (
        <Link href={link} className="button-panel p-4 flex gap-3 rounded-md items-center">
            {icon}
            {text}
        </Link>
    );
}
