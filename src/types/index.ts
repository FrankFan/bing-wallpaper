export type ArrInArr = Array<Array<string>>;
export type JsonArr = JsonItem[];

export interface ImgContainerProps {
  title: string;
  url: string;
  bing_url: string;
  copyright: string;
  description: string;
  index: number;
  caption?: string;
  date: string;
}

export interface JsonItem {
  title: string;
  url: string;
  bing_url: string;
  copyright: string;
  description: string;
  date: string;
  subtitle?: string;
  caption?: string;
}
