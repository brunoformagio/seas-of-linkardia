import React from "react";

    export const RenderGameArea = ({children}: {children: React.ReactNode}) => {


    return (
      <div className="relative h-[40vh]  w-screen">
        <div className="relative flex flex-col h-full items-center justify-center">
          <div className="w-screen h-[256px] absolute bottom-5 left-0 flex flex-col items-center justify-center  bg-[url('/ocean_l2.gif')] opacity-50 scale-x-[-100%] bg-[length:512px_256px] bg-bottom bg-repeat-x" />
          
          {children}
          
          <div className="w-screen h-[64px]  absolute bottom-0 left-0 flex flex-col items-center justify-center  bg-[url('/ocean_l1.gif')] bg-[length:512px_64px] bg-top bg-repeat-x" />
        </div>
        <div className="h-full bg-[#063c65] w-full"></div>
      </div>
    )
}