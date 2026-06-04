import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "../../lib/utils.js"
import { Button } from "./button.js"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command.js"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover.js"

interface ComboboxProps {
  options: {
    label: string
    options: { label: string; value: string }[]
  }[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  // Find the selected option label across all groups
  const selectedLabel = React.useMemo(() => {
    if (!value) return ""
    for (const group of options) {
      const option = group.options.find((opt) => opt.value === value)
      if (option) return option.label
    }
    return ""
  }, [value, options])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl text-[16px] md:text-sm font-normal text-left px-3 py-2 shadow-none hover:bg-[#FAF9F6]/80 focus:ring-0 focus:ring-offset-0 focus:border-[#111111]"
        >
          {selectedLabel ? (
            <span className="truncate">{selectedLabel}</span>
          ) : (
            <span className="text-muted-foreground truncate">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl border border-[#E2E2E0] bg-white shadow-md z-[60]" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="text-[16px] md:text-sm" />
          <CommandList className="max-h-[240px]">
            <CommandEmpty>{emptyText}</CommandEmpty>
            {options.map((group) => (
              <CommandGroup key={group.label} heading={group.label} className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[#6E6E6C] [&_[cmdk-group-heading]]:font-semibold">
                {group.options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue)
                      setOpen(false)
                    }}
                    className="text-sm cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
