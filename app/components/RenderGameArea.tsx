import React from "react";

    export const RenderGameArea = ({children}: {children: React.ReactNode}) => {

    const numberOfElements = () => {
        //figure out how many elements are in the children
        const childrenArray = React.Children.toArray(children);
        return childrenArray.length;
    }
    return (
      <div className="relative h-[40vh]  w-screen">
        <div className="relative flex flex-col h-full items-center justify-center">
          <div className="w-screen h-[256px] absolute bottom-5 left-0 flex flex-col items-center justify-center  bg-[url('/ocean_l2.gif')] opacity-50 scale-x-[-100%] bg-[length:512px_256px] bg-bottom bg-repeat-x" />
          <div 
          className={`grid px-10 w-screen bottom-[40px] content-start absolute  `}
          style={{gridTemplateColumns: `repeat(${numberOfElements()}, minmax(0, 1fr))`}}
          >
          {children}
          </div>
          <div className="w-screen h-[256px] absolute bottom-0 left-0 flex flex-col items-center justify-center  bg-[url('/ocean_l1.gif')] bg-[length:512px_256px] bg-bottom bg-repeat-x" />
        </div>
        <div className="h-full bg-[#063c65] w-full"></div>
      </div>
    )
}