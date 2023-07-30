import { useEffect, useRef, useState } from "react";
import { CSVToArray } from "../../utils";
import { ImgContainer } from "./ImgContainer";
import { PhotoProvider } from "react-photo-view";
import { ArrInArr } from "../../../types/index";
const ENDPOINT_URL = `https://cdn.jsdelivr.net/gh/frankfan/bing-wallpaper/bing-wallpaper.csv`;

export const WallpaperList = () => {
  const [list, setList] = useState<ArrInArr>([]);

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
        // console.log(csv);
        setList(csv);
      })
      .catch((err) => {
        console.log(err);
        setList([]);
      });
  };

  const renderList = () => {
    return list.map((item, index) => {
      const [title, url, copyright, desc] = item;
      const props = {
        title,
        url,
        copyright,
        desc,
      };

      return (
        <div key={index} className="wallpaper_item">
          <ImgContainer index={index} {...props} />
        </div>
      );
    });
  };

  return (
    <div className="wallpaper px-14">
      <PhotoProvider>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10 lg:grid-cols-5">
          {renderList()}
        </div>
      </PhotoProvider>
    </div>
  );
};
