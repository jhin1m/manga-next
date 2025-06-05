import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecentComments from "./sidebar/RecentComments";
import HistoryReading from "./sidebar/HistoryReading";
import RecommendedManga from "./sidebar/RecommendedManga";
import MangaRankings from "./sidebar/MangaRankings";
import { useTranslations } from "next-intl";

// SVG Icons
const TrophyIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

export default function Sidebar() {
  const t = useTranslations('sidebar');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3 text-2xl">
          <CardTitle className="flex items-center">
            <TrophyIcon />
            {t('rankings')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MangaRankings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 text-2xl">
          <CardTitle className="flex items-center">
            <ChatIcon />
            {t('recentComments')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentComments />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 text-2xl">
          <CardTitle className="flex items-center">
            <ClockIcon />
            {t('readingHistory')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HistoryReading />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 text-2xl">
          <CardTitle className="flex items-center">
            <StarIcon />
            {t('recommendedManga')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecommendedManga />
        </CardContent>
      </Card>
    </div>
  );
}
