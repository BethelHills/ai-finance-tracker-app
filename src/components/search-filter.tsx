'use client'

import { useState } from 'react'
import { Search, Filter, X, Calendar, DollarSign, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface SearchFilterProps {
  onSearch: (query: string) => void
  onFilter: (filters: FilterState) => void
  onClear: () => void
}

interface FilterState {
  category: string
  type: string
  dateRange: string
  amountRange: string
  tags: string[]
}

const categories = [
  'All Categories',
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Salary',
  'Freelance',
  'Investment',
  'Other'
]

const types = [
  'All Types',
  'Income',
  'Expense',
  'Transfer'
]

const dateRanges = [
  'All Time',
  'Today',
  'This Week',
  'This Month',
  'Last Month',
  'Last 3 Months',
  'This Year',
  'Custom Range'
]

const amountRanges = [
  'All Amounts',
  'Under $10',
  '$10 - $50',
  '$50 - $100',
  '$100 - $500',
  '$500 - $1000',
  'Over $1000'
]

const popularTags = [
  'groceries',
  'gas',
  'coffee',
  'dining',
  'subscription',
  'utilities',
  'rent',
  'salary',
  'freelance',
  'investment'
]

export function SearchFilter({ onSearch, onFilter, onClear }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    category: 'All Categories',
    type: 'All Types',
    dateRange: 'All Time',
    amountRange: 'All Amounts',
    tags: []
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }

  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    handleFilterChange('tags', newTags)
  }

  const handleClear = () => {
    setSearchQuery('')
    setFilters({
      category: 'All Categories',
      type: 'All Types',
      dateRange: 'All Time',
      amountRange: 'All Amounts',
      tags: []
    })
    onClear()
  }

  const activeFiltersCount = [
    filters.category !== 'All Categories',
    filters.type !== 'All Types',
    filters.dateRange !== 'All Time',
    filters.amountRange !== 'All Amounts',
    filters.tags.length > 0
  ].filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Search & Filter</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount} active</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions, merchants, or descriptions..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => handleSearch('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Select value={filters.amountRange} onValueChange={(value) => handleFilterChange('amountRange', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {amountRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Tags</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        onClick={() => handleTagToggle(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'Custom Range' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <Input type="date" />
                </div>
              </div>
            )}

            {/* Amount Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Amount</label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Amount</label>
                <Input type="number" placeholder="1000.00" />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Active Filters</span>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.category !== 'All Categories' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Category: {filters.category}</span>
                  <button onClick={() => handleFilterChange('category', 'All Categories')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.type !== 'All Types' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Type: {filters.type}</span>
                  <button onClick={() => handleFilterChange('type', 'All Types')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.dateRange !== 'All Time' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Date: {filters.dateRange}</span>
                  <button onClick={() => handleFilterChange('dateRange', 'All Time')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.amountRange !== 'All Amounts' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Amount: {filters.amountRange}</span>
                  <button onClick={() => handleFilterChange('amountRange', 'All Amounts')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>Tag: {tag}</span>
                  <button onClick={() => handleTagToggle(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
