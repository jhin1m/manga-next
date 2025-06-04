import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecentComments from "./sidebar/RecentComments";
import HistoryReading from "./sidebar/HistoryReading";
import RecommendedManga from "./sidebar/RecommendedManga";
import MangaRankings from "./sidebar/MangaRankings";
import { useTranslations } from "next-intl";

export default function Sidebar() {
  const t = useTranslations('sidebar');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3 text-2xl">
          <CardTitle>{t('rankings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <MangaRankings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 text-2xl">
          <CardTitle>{t('recentComments')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentComments />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 text-2xl">
          <CardTitle>{t('readingHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <HistoryReading />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 text-2xl">
          <CardTitle>{t('recommendedManga')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RecommendedManga />
        </CardContent>
      </Card>
    </div>
  );
}
