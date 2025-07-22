import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Province, DestinationResponse } from '@/services/provinceService';

interface DestinationDropdownProps {
  value?: number;
  onValueChange: (value: number) => void;
  departureProvinceId?: number;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

export function DestinationDropdown({
  value,
  onValueChange,
  departureProvinceId,
  placeholder,
  disabled = false,
  className
}: DestinationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [destinations, setDestinations] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Province | null>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      if (!departureProvinceId) {
        setDestinations([]);
        setSelectedDestination(null);
        return;
      }

      setLoading(true);
      try {
        const { provinceService } = await import('@/services/provinceService');
        const data: DestinationResponse = await provinceService.getDestinationsFromProvince(departureProvinceId);
        setDestinations(data.destinations);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [departureProvinceId]);

  useEffect(() => {
    if (value && destinations.length > 0) {
      const destination = destinations.find(d => d.id === value);
      setSelectedDestination(destination || null);
    } else {
      setSelectedDestination(null);
    }
  }, [value, destinations]);

  // Reset selection when departure province changes
  useEffect(() => {
    setSelectedDestination(null);
    onValueChange(0);
  }, [departureProvinceId, onValueChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedDestination && "text-muted-foreground",
            className
          )}
          disabled={disabled || loading || !departureProvinceId}
        >
          {loading ? (
            "Đang tải..."
          ) : !departureProvinceId ? (
            "Vui lòng chọn điểm đi trước"
          ) : selectedDestination ? (
            selectedDestination.name
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm kiếm điểm đến..." />
          <CommandList>
            <CommandEmpty>
              {!departureProvinceId 
                ? "Vui lòng chọn điểm đi trước" 
                : "Không tìm thấy tuyến xe đến điểm này."
              }
            </CommandEmpty>
            <CommandGroup>
              {destinations.map((destination) => (
                <CommandItem
                  key={destination.id}
                  value={`${destination.name} ${destination.code}`}
                  onSelect={() => {
                    setSelectedDestination(destination);
                    onValueChange(destination.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedDestination?.id === destination.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{destination.name}</span>
                    <span className="text-sm text-muted-foreground">{destination.code}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 