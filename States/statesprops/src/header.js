import { useState } from "react";

const Header =(props)=>{
    const [name,setName]=useState("Atharv");
    return (
        <div>
        <h1>Hello , I am {name}</h1>
        
        <button onClick={()=>{
            setName("Varun");
        }}>Get Name</button>
        <button onClick={()=>{
            setName("Varun");
        }}>Get Name</button>
        </div>
    );
};
export default Header;