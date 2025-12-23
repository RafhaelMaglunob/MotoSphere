import React from 'react'
import { NavLink } from 'react-router-dom'

import { BackIcon } from '../component/svg/BackIcon'
import Helmet from '../component/img/Helmet.png'

function Mission() {
    return (
        <div className="bg-[#0A0E27] h-screen p-4 overflow-hidden">
            <NavLink to="/about-us">
                <BackIcon className="text-white w-13 h-10" />
            </NavLink>
            <div className="flex flex-col md:flex-row items-center">
                <img src={Helmet} alt="Helmet" className="w-150"/>
                <div className="text-white alegreya">
                    <h1 className="text-sm">OUR MISSION</h1>
                    <span className="font-semibold md:text-5xl leading-[1.4]">
                        Build the future of rider safety <br/>through smart helmet <br/>technology that detects <br/>accidents and automatically <br/>informs emergency contacts.
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Mission
