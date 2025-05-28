import { useEffect, useRef, useState } from "react";
import { ImgContainer } from "./ImgContainer";
import { PhotoProvider } from "react-photo-view";
import { SkeletonList } from "./SkeletonContainer";
import { ArrInArr, JsonArr } from "@/types";
import { useCsv } from "@/hooks/useCsv";
import { pageSize } from "@/utils/constants";
import { useJson } from "@/hooks/useJson";

export const WallpaperList = () => {
  // const { csvList, loading, getListByPage } = useCsv();
  const { jsonList, loading, getListByPage } = useJson();

  const [list, setList] = useState<JsonArr>([]);
  // useRef 不会引起组件刷新
  // let list = useRef<ArrInArr>([]);

  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const refPageIndex = useRef<number>(0);

  // useEffect(() => {
  //   // 初始化加载第一页
  //   loadByPage();
  // }, [refPageIndex.current, csvList]);

  const loadByPage = () => {
    const pagedList = getListByPage(refPageIndex.current, pageSize);

    // 由于 React 的状态更新机制，要使用函数式更新，否则更新后还是旧的list
    setList((prevList) => prevList.concat(pagedList));
  };

  useEffect(() => {
    const ob = initObserver();

    // clean up
    return () => {
      if (loadMoreRef.current && ob) {
        ob.unobserve(loadMoreRef.current);
        ob.disconnect();
      }
    };
  }, [loadMoreRef.current, loading]);

  const initObserver = () => {
    if (!loadMoreRef.current) return;

    const callback = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];

      console.log("---", entry);

      if (entry.isIntersecting) {
        if (isLoading) return;
        setIsLoading(true);
        console.log("加载中...");

        // setPageIndex(pageIndex + 1);
        refPageIndex.current = refPageIndex.current + 1;

        console.log("pageIndex = ", refPageIndex.current);

        // onMount 时也会自动触发一次
        loadByPage();

        setIsLoading(false);
      }
    };

    const ob = new IntersectionObserver(callback, {
      root: null,
      threshold: 0.5,
    });

    if (loadMoreRef.current) {
      ob.observe(loadMoreRef.current);
    }

    return ob;
  };

  const renderWallpaperList = () => {
    return list.map((item, index) => {
      const { title, url, copyright, description, caption, date, bing_url } =
        item;
      const props = {
        title,
        url,
        copyright,
        description,
        caption,
        date,
        bing_url,
      };

      return (
        <div key={index} className="wallpaper_item">
          <ImgContainer index={index} {...props} />
        </div>
      );
    });
  };

  const renderDebugPanel = () => {
    return (
      <div className="fixed right-0 top-0 z-50 mr-2 mt-2 rounded bg-slate-200 p-2 text-xs font-bold text-red-500">
        <div>page index: {refPageIndex.current}</div>
        <div>render list: {list.length}</div>
        <div>total count {jsonList.length}</div>
      </div>
    );
  };

  if (loading) {
    return <SkeletonList />;
  }

  return (
    <div className="wallpaper px-14">
      {window.location.search.includes("?debug=1") && renderDebugPanel()}
      <PhotoProvider>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10 lg:grid-cols-5">
          {renderWallpaperList()}
        </div>
      </PhotoProvider>
      {list.length <= jsonList.length && (
        <div ref={loadMoreRef} className="load_more my-10 flex justify-center">
          loading...
        </div>
      )}
    </div>
  );
};
