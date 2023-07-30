import { ImageViewer } from "antd-mobile";
import { ImageViewerShowHandler } from "antd-mobile/es/components/image-viewer";
import { useEffect, useRef, useState } from "react";
import { CSVToArray } from "../../utils";
import { ImgContainer } from "./ImgContainer";
import "./index.scss";

type ArrInArr = Array<Array<string>>;
interface ItemType {
  title: string;
  url: string;
  copyright: string;
  desc: string;
}

const ENDPOINT_URL = `https://cdn.jsdelivr.net/gh/frankfan/bing-wallpaper/bing-wallpaper.csv`;

export const WallpaperList = () => {
  const [list, setList] = useState<ArrInArr>([]);
  const handlerRef = useRef<ImageViewerShowHandler>();

  useEffect(() => {
    getList();
  }, []);

  const getList = () => {
    fetch(ENDPOINT_URL)
      .then((response) => response.text())
      .then((data) => {
        const csv = CSVToArray(data);
        csv.pop();
        csv.shift();
        console.log(csv);

        setList(csv);
      })
      .catch((err) => console.log(err));
  };

  const onImgClick = ({
    defaultIndex,
    images,
  }: {
    images?: string[];
    defaultIndex?: number;
  }) => {
    console.log("123");

    const handler = ImageViewer.Multi.show({
      defaultIndex,
      images,
    });
    handlerRef.current = handler;
  };

  const renderList = () => {
    return list.map((item, index) => {
      const [title, url, copyright, desc] = item;
      const props = {
        title,
        url,
        copyright,
        desc,
        onImgClick: () =>
          onImgClick({
            defaultIndex: index,
            images: list.map((arr) => arr[1]),
          }),
      };

      return (
        <div key={index} className="wallpaper_item">
          <ImgContainer {...props} />
        </div>
      );
    });
  };

  return (
    <div className="wallpaper px-14">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10 lg:grid-cols-5">
        {renderList()}
      </div>
      {/* <Grid columns={2} gap={8} style={{ justifyItems: "center" }}>
        {renderList()}
      </Grid> */}
    </div>
  );
};
