import FilterBar from "@/components/Filter/FilterBar";
import DistrictRanking from "@/components/Sidebar/DistrictRanking";
import DistrictDetail from "@/components/Detail/DistrictDetail";
import AirQualityProvider from "@/components/AirQualityProvider";
import SeoulMapWrapper from "@/components/Map/SeoulMapWrapper";

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <AirQualityProvider />
      <FilterBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <SeoulMapWrapper />
        </div>
        <aside className="w-80 border-l border-gray-200 bg-white overflow-auto flex-shrink-0">
          <DistrictDetail />
          <DistrictRanking />
        </aside>
      </div>
    </div>
  );
}
