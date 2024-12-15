// File: pages/KanjiDetailPage.tsx

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { KanjiDetail } from "../types/kanji";
import { kanjiService } from "../services/kanjiService";
import KanjiDetails from "../components/KanjiDetails";

const KanjiDetailPage: React.FC = () => {
  const [kanjiData, setKanjiData] = useState<KanjiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { kanji } = router.query;

  useEffect(() => {
    if (kanji) {
      kanjiService.getKanjiDetails(kanji as string)
        .then(data => {
          setKanjiData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error(error);
          setLoading(false);
        });
    }
  }, [kanji]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!kanjiData) {
    return <p>Kanji not found</p>;
  }

  return <>
    { /* <a href={`http://www.kanjidamage.com/kanji/search?utf8=✓&q=${kanji}`}>KanjiDamage</a> */ }
    <KanjiDetails kanjiData={kanjiData} />
  </>;
};

export default KanjiDetailPage;
