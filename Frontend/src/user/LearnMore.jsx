import React from 'react'
import { NavLink } from 'react-router-dom'

import { BackIcon } from '../component/svg/BackIcon'

{/* W w */}
function LearnMore() {
    return (
        <div className="bg-[#0A0E27] h-screen p-4">
            <NavLink to="/why-motosphere">
                <BackIcon className="text-white w-13 h-10" />
            </NavLink>
            <h1 className="font-bold text-4xl p-4 mt-7 text-white">Why us?</h1>
            <div className="flex flex-col md:flex-row justify-between text-white px-4 md:px-40 py-4 ">
                <div className="alegreya flex flex-col gap-3">
                    <label className="font-bold text-3xl">Faster Emergency Response</label>
                    <span className="font-light text-md px-4">● Automatically detects accidents and alerts emergency <br />contacts instantly.</span>
                
                    <label className="font-bold text-3xl">Automatic Accident Detection</label>
                    <span className="font-light text-md px-4">● Sensors detect impacts and abnormal <br />movements without rider action.</span>
                
                    <label className="font-bold text-3xl">Real-Time Location Tracking</label>
                    <span className="font-light text-md px-4">● GPS shares the rider’s exact accident location.</span>
                </div>

                <div className="alegreya flex flex-col gap-3">
                    <label className="font-bold text-3xl">Improves Road Safety</label>
                    <span className="font-light text-md px-4">● Faster response helps reduce accident severity.</span>
                
                    <label className="font-bold text-3xl">Designed for Helmets</label>
                    <span className="font-light text-md px-4">● This technology is detachable it can be use to <br />any helmets.</span>
                
                    <label className="font-bold text-3xl">Cost-Effective Solution</label>
                    <span className="font-light text-md px-4">● Combines camera, sensors, and tracking in <br/>one helmet.</span>
                </div>
            </div>
        </div>
    )
}

export default LearnMore
