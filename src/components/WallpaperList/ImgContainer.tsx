import './index.scss';

interface ItemType {
  title: string;
  url: string;
  copyright: string;
  desc: string;
}

export const ImgContainer = ({ title, url, copyright, desc }: ItemType) => {
  return (
    <div className='img-container'>
      <div className='img'>
        <img src={url} alt='' />
        <div className='title'>{title}</div>
        <div className='copyright'>{copyright}</div>
        <div className='desc'>{desc}</div>
      </div>
    </div>
  );
};
