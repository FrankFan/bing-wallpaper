import { Button, Card, Image } from 'antd-mobile';
import { useEffect, useState } from 'react';
import { CSVToArray } from '../../utils';
import { ImgContainer } from './ImgContainer';
import './index.scss';

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
      })
      .catch((err) => console.log(err));
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
        <div key={index} className='row'>
          <ImgContainer {...props} />
        </div>
      );
    });
  };

  return <div className='wallpaper'>{renderList()}</div>;
};
