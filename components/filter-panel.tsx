"use client"

import { useState, useEffect } from "react"
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  OutlinedInput,
  SelectChangeEvent
} from "@mui/material"
import type { Email } from "@/types/email"

interface FilterPanelProps {
  emails: Email[]
  onFiltersChange: (filters: {
    deRoles: string[]
    paraRoles: string[]
    tags: string[]
  }) => void
}

export default function FilterPanel({ emails, onFiltersChange }: FilterPanelProps) {
  const [deRoles, setDeRoles] = useState<string[]>([])
  const [paraRoles, setParaRoles] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])

  // Extraer valores únicos de los emails
  const allDeRoles = Array.from(new Set(
    emails.flatMap(email => 
      email.de_rol ? email.de_rol.split(',').map(rol => rol.trim()) : []
    )
  )).filter(rol => rol.length > 0).sort()

  const allParaRoles = Array.from(new Set(
    emails.flatMap(email => 
      email.para_rol ? email.para_rol.split(',').map(rol => rol.trim()) : []
    )
  )).filter(rol => rol.length > 0).sort()

  const allTags = Array.from(new Set(
    emails.flatMap(email => 
      email.tag_tema ? email.tag_tema.split(',').map(tag => tag.trim()) : []
    )
  )).filter(tag => tag.length > 0).sort()

  const handleDeRolesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[]
    setDeRoles(value)
    onFiltersChange({ deRoles: value, paraRoles, tags })
  }

  const handleParaRolesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[]
    setParaRoles(value)
    onFiltersChange({ deRoles, paraRoles: value, tags })
  }

  const handleTagsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[]
    setTags(value)
    onFiltersChange({ deRoles, paraRoles, tags: value })
  }

  const clearAllFilters = () => {
    setDeRoles([])
    setParaRoles([])
    setTags([])
    onFiltersChange({ deRoles: [], paraRoles: [], tags: [] })
  }

  const hasActiveFilters = deRoles.length > 0 || paraRoles.length > 0 || tags.length > 0

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filtros</Typography>
        {hasActiveFilters && (
          <Chip 
            label="Limpiar filtros" 
            onClick={clearAllFilters}
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Roles del remitente</InputLabel>
          <Select
            multiple
            value={deRoles}
            onChange={handleDeRolesChange}
            input={<OutlinedInput label="Roles del remitente" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={value} 
                    size="small"
                    onDelete={(e) => {
                      e.stopPropagation()
                      const newDeRoles = deRoles.filter(r => r !== value)
                      setDeRoles(newDeRoles)
                      onFiltersChange({ deRoles: newDeRoles, paraRoles, tags })
                    }}
                  />
                ))}
              </Box>
            )}
          >
            {allDeRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Roles del destinatario</InputLabel>
          <Select
            multiple
            value={paraRoles}
            onChange={handleParaRolesChange}
            input={<OutlinedInput label="Roles del destinatario" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={value} 
                    size="small"
                    onDelete={(e) => {
                      e.stopPropagation()
                      const newParaRoles = paraRoles.filter(r => r !== value)
                      setParaRoles(newParaRoles)
                      onFiltersChange({ deRoles, paraRoles: newParaRoles, tags })
                    }}
                  />
                ))}
              </Box>
            )}
          >
            {allParaRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Tags/Temas</InputLabel>
          <Select
            multiple
            value={tags}
            onChange={handleTagsChange}
            input={<OutlinedInput label="Tags/Temas" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={value} 
                    size="small" 
                    color="primary"
                    onDelete={(e) => {
                      e.stopPropagation()
                      const newTags = tags.filter(t => t !== value)
                      setTags(newTags)
                      onFiltersChange({ deRoles, paraRoles, tags: newTags })
                    }}
                  />
                ))}
              </Box>
            )}
          >
            {allTags.map((tag) => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {hasActiveFilters && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Filtros activos:
          </Typography>
          {deRoles.map(role => (
            <Chip 
              key={`de-${role}`} 
              label={`De: ${role}`} 
              size="small" 
              variant="outlined"
              onDelete={() => {
                const newDeRoles = deRoles.filter(r => r !== role)
                setDeRoles(newDeRoles)
                onFiltersChange({ deRoles: newDeRoles, paraRoles, tags })
              }}
            />
          ))}
          {paraRoles.map(role => (
            <Chip 
              key={`para-${role}`} 
              label={`Para: ${role}`} 
              size="small" 
              variant="outlined"
              onDelete={() => {
                const newParaRoles = paraRoles.filter(r => r !== role)
                setParaRoles(newParaRoles)
                onFiltersChange({ deRoles, paraRoles: newParaRoles, tags })
              }}
            />
          ))}
          {tags.map(tag => (
            <Chip 
              key={`tag-${tag}`} 
              label={`Tag: ${tag}`} 
              size="small" 
              variant="outlined" 
              color="primary"
              onDelete={() => {
                const newTags = tags.filter(t => t !== tag)
                setTags(newTags)
                onFiltersChange({ deRoles, paraRoles, tags: newTags })
              }}
            />
          ))}
        </Box>
      )}
    </Paper>
  )
} 