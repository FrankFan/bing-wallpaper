interface ItemType {
  title: string;
  url: string;
  copyright: string;
  desc: string;
  onImgClick: () => void;
}

export const ImgContainer = ({
  title,
  url,
  copyright,
  desc,
  onImgClick,
}: ItemType) => {
  return (
    <div className="img-container">
      <div className="img">
        <img
          className="rounded-md hover:opacity-70"
          src={url}
          alt="img"
          onClick={onImgClick}
        />
        <div className="mt-3 font-mono font-semibold text-slate-700">
          {title}
        </div>
        <div className="my-2 font-mono text-slate-400">{copyright}</div>
        <div className="font-medium text-slate-600">{desc}</div>
      </div>
    </div>
  );
};
