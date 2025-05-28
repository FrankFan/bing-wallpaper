import { JsonArr } from "@/types";
import { ENDPOINT_URL, ENDPOINT_URL2 } from "@/utils/constants";
import { useEffect, useState } from "react";

export const useJson = () => {
  const [jsonList, setJsonList] = useState<JsonArr>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJsonContent();
  }, []);

  const getJsonContent = () => {
    fetch(ENDPOINT_URL2)
      .then((response) => response.json())
      .then((data) => {
        const json = data.reverse();
        // @ts-ignore
        window.json = json;
        setJsonList(json);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setJsonList([]);
        setLoading(false);
      });
  };

  const getListByPage = (pageIndex: number, pageSize: number): JsonArr => {
    const start = (pageIndex - 1) * pageSize;
    const end = pageIndex * pageSize;
    const onePageList = jsonList.slice(start, end);
    return onePageList;
  };

  return { jsonList, loading, getJsonContent, getListByPage };
};
