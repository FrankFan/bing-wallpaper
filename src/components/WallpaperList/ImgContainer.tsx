import { ImgContainerProps } from "@/types";
import { PhotoView } from "react-photo-view";

export const ImgContainer = ({
  title,
  url,
  copyright,
  desc,
  index,
}: ImgContainerProps) => {
  return (
    <>
      <PhotoView key={index} src={url}>
        <img className="rounded-md hover:opacity-70" src={url} alt="img" />
      </PhotoView>
      <div className="mt-3 font-mono font-semibold text-slate-700">{title}</div>
      <div className="my-2 font-mono text-xs text-slate-400">{copyright}</div>
      <div className="font-medium text-slate-600">{desc}</div>
    </>
  );
};
