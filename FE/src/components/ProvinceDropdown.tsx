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
import { Province } from '@/services/provinceService';

interface ProvinceDropdownProps {
  value?: number;
  onValueChange: (value: number) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

export function ProvinceDropdown({
  value,
  onValueChange,
  placeholder,
  disabled = false,
  className
}: ProvinceDropdownProps) {
  const [open, setOpen] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      try {
        const { provinceService } = await import('@/services/provinceService');
        const data = await provinceService.getAllProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    if (value && provinces.length > 0) {
      const province = provinces.find(p => p.id === value);
      setSelectedProvince(province || null);
    } else {
      setSelectedProvince(null);
    }
  }, [value, provinces]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedProvince && "text-muted-foreground",
            className
          )}
          disabled={disabled || loading}
        >
          {loading ? (
            "Đang tải..."
          ) : selectedProvince ? (
            selectedProvince.name
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm kiếm tỉnh thành..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy tỉnh thành.</CommandEmpty>
            <CommandGroup>
              {provinces.map((province) => (
                <CommandItem
                  key={province.id}
                  value={`${province.name} ${province.code}`}
                  onSelect={() => {
                    setSelectedProvince(province);
                    onValueChange(province.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProvince?.id === province.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{province.name}</span>
                    <span className="text-sm text-muted-foreground">{province.code}</span>
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