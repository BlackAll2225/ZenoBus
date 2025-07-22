import React, { useState } from 'react';
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ProvinceDropdown } from './ProvinceDropdown';
import { DestinationDropdown } from './DestinationDropdown';

interface TripSearchFormProps {
  onSearch: (searchData: {
    departureProvinceId: number;
    arrivalProvinceId: number;
    departureDate: string;
  }) => void;
  loading?: boolean;
  className?: string;
}

export function TripSearchForm({ onSearch, loading = false, className }: TripSearchFormProps) {
  const [departureProvinceId, setDepartureProvinceId] = useState<number>(0);
  const [arrivalProvinceId, setArrivalProvinceId] = useState<number>(0);
  const [date, setDate] = useState<Date>(() => new Date());

  const handleSearch = () => {
    if (!departureProvinceId || !arrivalProvinceId || !date) {
      return;
    }

    const formattedDate = format(date, 'yyyy-MM-dd');
    onSearch({
      departureProvinceId,
      arrivalProvinceId,
      departureDate: formattedDate
    });
  };

  const isFormValid = departureProvinceId && arrivalProvinceId && date;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Điểm đi */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Điểm đi
          </label>
          <ProvinceDropdown
            value={departureProvinceId}
            onValueChange={setDepartureProvinceId}
            placeholder="Chọn điểm đi"
            disabled={loading}
          />
        </div>

        {/* Điểm đến */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Điểm đến
          </label>
          <DestinationDropdown
            value={arrivalProvinceId}
            onValueChange={setArrivalProvinceId}
            departureProvinceId={departureProvinceId}
            placeholder="Chọn điểm đến"
            disabled={loading}
          />
        </div>

        {/* Ngày đi */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Ngày đi
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "EEEE, dd/MM/yyyy", { locale: vi })
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(d) => {
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  d.setHours(0,0,0,0);
                  return d < today;
                }}
                locale={vi}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Nút tìm kiếm */}
      <Button 
        onClick={handleSearch}
        disabled={!isFormValid || loading}
        className="w-full md:w-auto"
        size="lg"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Đang tìm kiếm...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Tìm chuyến xe</span>
          </div>
        )}
      </Button>
    </div>
  );
} 