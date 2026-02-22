import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Input'
import { Search, Filter, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export function Opportunities() {
  const [opportunities, setOpportunities] = useState([])
  const [filteredOpportunities, setFilteredOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [skillFilter, setSkillFilter] = useState('')

  useEffect(() => {
    fetchOpportunities()
  }, [])

  useEffect(() => {
    filterOpportunities()
  }, [searchTerm, typeFilter, skillFilter, opportunities])

  const fetchOpportunities = async () => {
    setLoading(true)
    try {
      const data = await apiService.getAllOpportunities()
      setOpportunities(data)
      setFilteredOpportunities(data)
    } catch (error) {
      console.error('Error fetching opportunities:', error)
      toast.error('Failed to fetch opportunities')
    } finally {
      setLoading(false)
    }
  }

  const filterOpportunities = () => {
    let filtered = [...opportunities]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (opp) =>
          opp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.details?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((opp) => opp.type === typeFilter)
    }

    // Skill filter (search in requirements text)
    if (skillFilter) {
      filtered = filtered.filter((opp) => {
        const requirements = opp.requirements || ''
        return requirements.toLowerCase().includes(skillFilter.toLowerCase())
      })
    }

    setFilteredOpportunities(filtered)
  }

  const getTypeLabel = (type) => {
    const labels = {
      research: 'Research',
      project: 'Project',
      internship: 'Internship',
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-heading">Research Opportunities</h1>
        <p className="text-body mt-1 text-sm sm:text-base">Browse and apply to research projects and opportunities</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="research">Research</option>
              <option value="project">Project</option>
              <option value="internship">Internship</option>
            </Select>
            <Input
              placeholder="Filter by skill..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-body">No opportunities found. Try adjusting your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.ID} hover>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="primary" className="text-xs">{getTypeLabel(opportunity.type)}</Badge>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2 text-heading">{opportunity.name}</h3>
                <p className="text-body text-sm mb-4 line-clamp-3">{opportunity.details}</p>
                
                {opportunity.requirement_tags && opportunity.requirement_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {opportunity.requirement_tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="default" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                    {opportunity.requirement_tags.length > 3 && (
                      <Badge variant="default" className="text-xs">
                        +{opportunity.requirement_tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-default">
                  <div className="text-xs sm:text-sm text-muted truncate mr-2">
                    {opportunity.professor?.first_name} {opportunity.professor?.last_name}
                  </div>
                  <Button size="sm" as={Link} to={`/opportunities/${opportunity.ID}`}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


