"use client";

import * as React from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

export interface AsyncComboboxOption {
  value: string;
  label: string;
}

interface AsyncSearchableComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  // Async data fetching
  fetchOptions: (params: { page: number; search: string }) => Promise<{
    items: AsyncComboboxOption[];
    hasMore: boolean;
  }>;
  // Debounce delay in ms
  debounceDelay?: number;
}

export function AsyncSearchableCombobox({
  value,
  onValueChange,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ditemukan.",
  disabled = false,
  className,
  fetchOptions,
  debounceDelay = 300,
}: AsyncSearchableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<AsyncComboboxOption[]>([]);
  const [selectedOption, setSelectedOption] = React.useState<AsyncComboboxOption | null>(null);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  
  const listRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the current search term to prevent stale scroll appends
  const currentSearchRef = React.useRef("");
  const currentPageRef = React.useRef(1);

  // Fetch data
  const loadOptions = React.useCallback(async (pageNum: number, searchTerm: string, append: boolean = false) => {
    setLoading(true);
    try {
      const result = await fetchOptions({ page: pageNum, search: searchTerm });
      
      // Only apply results if the search term is still current (prevents race conditions)
      if (searchTerm === currentSearchRef.current) {
        setOptions(prev => append ? [...prev, ...result.items] : result.items);
        setHasMore(result.hasMore);
        currentPageRef.current = pageNum;
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [fetchOptions]);

  // Initial load when popover opens
  React.useEffect(() => {
    if (open) {
      setPage(1);
      setSearch("");
      currentSearchRef.current = "";
      currentPageRef.current = 1;
      setInitialLoading(true);
      loadOptions(1, "");
    }
  }, [open, loadOptions]);

  // Handle search with debounce
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Show loading indicator immediately for better UX
    setLoading(true);
    
    debounceRef.current = setTimeout(() => {
      // Update refs immediately before fetch
      currentSearchRef.current = newSearch;
      currentPageRef.current = 1;
      setPage(1);
      setOptions([]); // Clear options before new search
      loadOptions(1, newSearch);
    }, debounceDelay);
  };

  // Handle scroll for infinite loading
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const threshold = 20;
    
    // Only proceed if not loading and there's more data
    // Also check that page matches current state to prevent stale appends
    if (scrollHeight - scrollTop - clientHeight < threshold && hasMore && !loading) {
      const nextPage = currentPageRef.current + 1;
      setPage(nextPage);
      loadOptions(nextPage, currentSearchRef.current, true);
    }
  }, [hasMore, loading, loadOptions]);

  // Find selected option for display (from value prop)
  React.useEffect(() => {
    if (value && options.length > 0) {
      const found = options.find(opt => opt.value === value);
      if (found) {
        setSelectedOption(found);
      }
    } else if (!value) {
      setSelectedOption(null);
    }
  }, [value, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0" 
        align="start" 
        side="bottom" 
        avoidCollisions={false}
      >
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={search}
            onValueChange={handleSearchChange}
          />
          <CommandList 
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-[200px] overflow-y-auto"
          >
            {initialLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : options.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange?.(option.value === value ? "" : option.value);
                      setSelectedOption(option.value === value ? null : option);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))}
                {loading && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
