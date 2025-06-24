"use client"

import { Paper, Typography, Box, Divider, Button, useMediaQuery, useTheme, Chip, IconButton } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import EditIcon from "@mui/icons-material/Edit"
import type { Email } from "@/types/email"

interface EmailDetailProps {
  email: Email
  onBack?: () => void
  onEditTags?: (email: Email) => void
}

export default function EmailDetail({ email, onBack, onEditTags }: EmailDetailProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Paper sx={{ p: 3, height: "70vh", overflow: "auto" }}>
      {isMobile && onBack && (
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
          Volver a la lista
        </Button>
      )}

      <Typography variant="h5" gutterBottom>
        {email.asunto}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" component="span" color="text.secondary">
          De:
        </Typography>{" "}
        <Typography variant="body1" component="span">
          {email.de}
        </Typography>
        {email.de_rol && (
          <Box sx={{ mt: 1 }}>
            {email.de_rol.split(',').map((rol, index) => (
              <Chip 
                key={index} 
                label={rol.trim()} 
                size="small" 
                sx={{ mr: 0.5, mb: 0.5 }} 
              />
            ))}
          </Box>
        )}
      </Box>

      {email.para && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" component="span" color="text.secondary">
            Para:
          </Typography>{" "}
          <Typography variant="body1" component="span">
            {email.para}
          </Typography>
          {email.para_rol && (
            <Box sx={{ mt: 1 }}>
              {email.para_rol.split(',').map((rol, index) => (
                <Chip 
                  key={index} 
                  label={rol.trim()} 
                  size="small" 
                  sx={{ mr: 0.5, mb: 0.5 }} 
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {email.cc && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" component="span" color="text.secondary">
            CC:
          </Typography>{" "}
          <Typography variant="body1" component="span">
            {email.cc}
          </Typography>
        </Box>
      )}

      {email.bcc && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" component="span" color="text.secondary">
            BCC:
          </Typography>{" "}
          <Typography variant="body1" component="span">
            {email.bcc}
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" component="span" color="text.secondary">
          Fecha:
        </Typography>{" "}
        <Typography variant="body1" component="span">
          {email.fecha ? new Date(email.fecha).toLocaleString() : "Sin fecha"}
        </Typography>
      </Box>

      {email.tag_tema && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" component="span" color="text.secondary">
              Temas:
            </Typography>
            {onEditTags && (
              <IconButton 
                size="small" 
                onClick={() => onEditTags(email)}
                sx={{ ml: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {email.tag_tema.split(',').map((tag, index) => (
              <Chip 
                key={index} 
                label={tag.trim()} 
                color="primary" 
                sx={{ mr: 0.5, mb: 0.5 }} 
              />
            ))}
          </Box>
        </Box>
      )}

      {!email.tag_tema && onEditTags && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" component="span" color="text.secondary">
              Temas:
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => onEditTags(email)}
              sx={{ ml: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Sin etiquetas
          </Typography>
        </Box>
      )}

      {email.tipo_mail && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" component="span" color="text.secondary">
            Tipo:
          </Typography>{" "}
          <Chip label={email.tipo_mail} variant="outlined" />
        </Box>
      )}

      {email.es_respuesta === "true" && (
        <Box sx={{ mb: 2 }}>
          <Chip label="Es respuesta" color="secondary" />
        </Box>
      )}

      {email.adjuntos && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" component="span" color="text.secondary">
            Adjuntos:
          </Typography>{" "}
          <Typography variant="body1" component="span">
            {email.adjuntos}
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
        {email.cuerpo}
      </Typography>
    </Paper>
  )
}
