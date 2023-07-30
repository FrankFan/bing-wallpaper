import { useEffect, useState } from "react";
import { CSVToArray } from "../../utils";
import { ImgContainer } from "./ImgContainer";
import { PhotoProvider } from "react-photo-view";
import { SkeletonList } from "./SkeletonContainer";
import { ArrInArr } from "@/types";

const ENDPOINT_URL = `https://cdn.jsdelivr.net/gh/frankfan/bing-wallpaper/bing-wallpaper.csv`;

export const WallpaperList = () => {
  const [list, setList] = useState<ArrInArr>([]);
  const [loading, setLoading] = useState(true);

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
        setList(csv);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setList([]);
        setLoading(false);
      });
  };

  const WallpaperList = () => {
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

  if (loading) {
    return <SkeletonList />;
  }

  return (
    <div className="wallpaper px-14">
      <PhotoProvider>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10 lg:grid-cols-5">
          {WallpaperList()}
        </div>
      </PhotoProvider>
    </div>
  );
};
