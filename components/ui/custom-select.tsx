"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const selectRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleScroll = () => {
      setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (isOpen && selectRef.current && dropdownRef.current) {
      const selectRect = selectRef.current.getBoundingClientRect()
      const dropdownHeight = dropdownRef.current.offsetHeight
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - selectRect.bottom
      const spaceAbove = selectRect.top

      // If there's not enough space below but enough space above, position above
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }, [isOpen])

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "appearance-none w-full px-3 sm:px-5 py-2.5 border text-gray-800 border-gray-200 rounded-[8px] bg-white text-sm font-medium focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition overflow-hidden text-left flex items-center justify-between",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 ring-purple-200 border-purple-400"
        )}
        style={{ maxWidth: '100%' }}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ml-2",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-50 w-full bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto",
            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
          style={{
            maxWidth: '100vw',
            left: 0,
            right: 0
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={cn(
                "w-full px-3 sm:px-5 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors",
                value === option.value && "bg-purple-50 text-purple-700 font-medium"
              )}
            >
              <span className="truncate block">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
