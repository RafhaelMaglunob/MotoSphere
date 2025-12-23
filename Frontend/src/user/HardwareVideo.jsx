import React from 'react'

function HardwareVideo() {
  return (
    <div>
      <div className="flex flex-row justify-between w-full">
        <span className="text-transparent">.</span>
        <div className="flex flex-col md:flex-row gap-10">
          
          <div className="flex flex-col text-white/90 bg-gray-400/30 p-4 rounded-4xl">
            <h2 className="text-lg font-semibold">Step 1: Unbox Your Hardware</h2>
            <p className="text-sm px-4">● Carefully remove all components from the packaging and <br/>ensure everything is included.</p>

            <h2 className="text-lg font-semibold">Step 2: Attach the Hardware to Your Helmet</h2>
            <p className="text-sm px-4">● Follow the instructions to securely attach the <br/>MotoSphere device to your helmet.</p>

            <h2 className="text-lg font-semibold">Step 3: Power On the Device</h2>
            <p className="text-sm px-4">● Press and hold the power button until the LED indicator <br/>lights up.</p>

            <h2 className="text-lg font-semibold">Step 4: Connect to Your Phone</h2>
            <p className="text-sm px-4">● Open the MotoSphere app on your phone, enable Bluetooth, <br/>and pair it with the <br/>device.</p>

            <h2 className="text-lg font-semibold">Step 5: Test the Connection</h2>
            <p className="text-sm px-4">● Check the app to ensure the device is connected and <br/>working properly.</p>
          </div>
          <div className="border-4 border-black max-w-[400px] w-[400px] h-[400px] max-h-[400px] p-12 text-white text-3xl flex items-center justify-center">
            Video
          </div>

        </div>
      </div>
    </div>
  )
}

export default HardwareVideo
