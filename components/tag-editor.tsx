"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  Chip, 
  Typography,
  IconButton,
  Alert,
  Autocomplete
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import type { Email } from "@/types/email"

interface TagEditorProps {
  open: boolean
  onClose: () => void
  email: Email | null
  onSave: (emailId: number, newTags: string) => void
  allTags: string[]
}

export default function TagEditor({ open, onClose, email, onSave, allTags }: TagEditorProps) {
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (email) {
      const emailTags = email.tag_tema ? email.tag_tema.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
      setTags(emailTags)
      setNewTag("")
      setError("")
    }
  }, [email])

  const handleAddTag = () => {
    const trimmedTag = newTag.trim()
    if (!trimmedTag) {
      setError("La etiqueta no puede estar vacía")
      return
    }
    if (tags.includes(trimmedTag)) {
      setError("Esta etiqueta ya está agregada")
      return
    }
    setTags([...tags, trimmedTag])
    setNewTag("")
    setError("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = () => {
    if (!email) return
    const tagsString = tags.join(', ')
    onSave(email.id, tagsString)
    onClose()
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddTag()
    }
  }

  // Filtrar etiquetas que no están ya agregadas
  const availableTags = allTags.filter(tag => !tags.includes(tag))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Editar etiquetas del email
      </DialogTitle>
      <DialogContent>
        {email && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Asunto: {email.asunto}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              De: {email.de}
            </Typography>
          </Box>
        )}

        <Typography variant="h6" gutterBottom>
          Etiquetas actuales:
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {tags.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Sin etiquetas
            </Typography>
          ) : (
            tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                deleteIcon={<DeleteIcon />}
                color="primary"
                variant="outlined"
              />
            ))
          )}
        </Box>

        <Typography variant="h6" gutterBottom>
          Agregar etiquetas:
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Autocomplete
            freeSolo
            options={availableTags}
            value={newTag}
            onChange={(_, newValue) => {
              if (typeof newValue === 'string') {
                setNewTag(newValue)
              } else if (newValue) {
                setNewTag(newValue)
              }
            }}
            inputValue={newTag}
            onInputChange={(_, newInputValue) => {
              setNewTag(newInputValue)
              setError("")
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Seleccionar etiqueta existente o escribir nueva"
                error={!!error}
                helperText={error}
                placeholder="Buscar etiqueta o escribir nueva..."
                onKeyPress={handleKeyPress}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Typography variant="body2">
                  {option}
                </Typography>
              </Box>
            )}
            renderTags={() => null}
            noOptionsText="No hay etiquetas disponibles"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleAddTag}
            disabled={!newTag.trim() || tags.includes(newTag.trim())}
            startIcon={<AddIcon />}
          >
            Agregar etiqueta
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          Puedes seleccionar etiquetas existentes del dropdown o escribir una nueva. 
          Presiona Enter o el botón "Agregar etiqueta" para agregar. 
          Haz clic en la X de una etiqueta para eliminarla.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Guardar cambios
        </Button>
      </DialogActions>
    </Dialog>
  )
} 