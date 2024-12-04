"use client";

import ChirperLogo from "@/components/ChirperLogo";
import { useCallback, useState } from "react";

export default function LoginPage() {
    const [isRegistering, setIsRegistering] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const onLogin = useCallback(() => {
        async function login() {
            const user = await getUserFromDb();
            if (user === null) {

            }
            else {

            }
        }
        login();
    }, []);

    const onRegister = useCallback(() => {
        async function register() {
            const user = await createNewUser();
            if (user === null) {

            }
            else {
                
            }
        }
        register();
    }, []);

    const changeUsername = useCallback((e) => {
        setUsername(e.target.value);
    }, []);

    const changePassword = useCallback((e) => {
        setPassword(e.target.value);
    }, []);

    return (
        <>
        <div className="fixed flex w-full justify-center pt-8"><ChirperLogo/></div>

        <div className="flex w-full h-full justify-center self-center">
            <div className="flex flex-col w-[500px] border border-secondary rounded-md overflow-hidden">
                <div className="flex flex-row justify-between">
                    <button 
                        onClick={() => { setIsRegistering(false); }} 
                        className={`${isRegistering ? 'button-panel border-secondary' : 'button text-white font-bold border-tertiary'} 
                            border-b py-4 px-4 text-center w-full self-center`}
                    >
                        Log in
                    </button> 
                    <button 
                        onClick={() => { setIsRegistering(true); }} 
                        className={`${isRegistering ? 'button text-white font-bold border-tertiary' : 'button-panel border-secondary'} 
                            border-b py-4 px-4 text-center w-full self-center `}
                    >
                        Register
                    </button> 
                </div>
                
                <div className="m-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm">Nickname</span>
                        <input type="text" value={username} onChange={changeUsername} className="rounded-md border border-tertiary p-2"/>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-sm">Password</span>
                        <input type="password" value={password} onChange={changePassword} className="rounded-md border border-tertiary p-2"/>
                    </div>

                    <button 
                        className="button text-white p-3 rounded-md font-bold"
                        onClick={isRegistering ? onRegister : onLogin}
                    >
                        {isRegistering ? 'Register' : 'Login'}
                    </button>
                </div>

            </div>
            
        </div>
        
        </>
    );
}