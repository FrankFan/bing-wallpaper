import { ArrInArr } from "@/types";
import { CSVToArray } from "@/utils";
import { ENDPOINT_URL } from "@/utils/constants";
import { useEffect, useState } from "react";

export const useCsv = () => {
  const [csvList, setCsvList] = useState<ArrInArr>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCsvContent();
  }, []);

  const getCsvContent = () => {
    fetch(ENDPOINT_URL)
      .then((response) => response.text())
      .then((data) => {
        const csv = CSVToArray(data);
        csv.pop();
        csv.shift();
        // @ts-ignore
        window.csv = csv;
        setCsvList(csv);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setCsvList([]);
        setLoading(false);
      });
  };

  const getListByPage = (pageIndex: number, pageSize: number): ArrInArr => {
    const start = (pageIndex - 1) * pageSize;
    const end = pageIndex * pageSize;
    const onePageList = csvList.slice(start, end);
    return onePageList;
  };

  return { csvList, loading, getCsvContent, getListByPage };
};
