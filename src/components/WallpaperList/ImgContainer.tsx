import { ImgContainerProps } from "@/types";
import { PhotoView } from "react-photo-view";
import { useState } from "react";

export const ImgContainer = ({
  title,
  caption,
  url,
  bing_url,
  copyright,
  description,
  date,
  index,
}: ImgContainerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <PhotoView key={index} src={bing_url}>
        <div className="relative w-full pt-[56.25%]">
          <img
            className={`absolute left-0 top-0 h-full w-full rounded-md object-cover transition-opacity duration-300 hover:opacity-70 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            src={bing_url || url}
            alt="img"
            onLoad={() => setIsLoaded(true)}
          />
          {!isLoaded && (
            <div className="absolute left-0 top-0 h-full w-full animate-pulse rounded-md bg-gray-200" />
          )}
        </div>
      </PhotoView>
      <div className="mt-3 font-mono font-semibold text-slate-700">
        {title || caption}
      </div>
      <div className="my-2 font-mono text-xs text-slate-400">{copyright}</div>
      <div className="font-medium text-slate-600">{date}</div>
      {/* <div className="font-medium text-slate-600">{description}</div> */}
    </>
  );
};
