import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecentComments from "./sidebar/RecentComments";
import HistoryReading from "./sidebar/HistoryReading";
import RecommendedManga from "./sidebar/RecommendedManga";

export default function Sidebar() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3 text-2xl">
          <CardTitle>Recent Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentComments />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 text-2xl">
          <CardTitle>Reading History</CardTitle>
        </CardHeader>
        <CardContent>
          <HistoryReading />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 text-2xl">
          <CardTitle>Recommended Manga</CardTitle>
        </CardHeader>
        <CardContent>
          <RecommendedManga />
        </CardContent>
      </Card>
    </div>
  );
}
