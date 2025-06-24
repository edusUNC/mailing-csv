"use client"

import { useState, useEffect, useRef } from "react"
import { Container, Grid, Typography, Box, TextField, CircularProgress, useMediaQuery, useTheme, Button, Alert, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import UploadIcon from "@mui/icons-material/Upload"
import DownloadIcon from "@mui/icons-material/Download"
import Papa from "papaparse"
import EmailDetail from "@/components/email-detail"
import EmailList from "@/components/email-list"
import FilterPanel from "@/components/filter-panel"
import TagEditor from "@/components/tag-editor"
import type { Email } from "@/types/email"

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([])
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    deRoles: [] as string[],
    paraRoles: [] as string[],
    tags: [] as string[]
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(200)
  const [tagEditorOpen, setTagEditorOpen] = useState(false)
  const [editingEmail, setEditingEmail] = useState<Email | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const cleanCsvValue = (value: string): string => {
    if (!value) return ""
    return value.trim()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log("No se seleccionó ningún archivo")
      return
    }

    // Limpiar errores previos
    setError(null)
    console.log("Archivo seleccionado:", file.name, "Tamaño:", file.size, "Tipo:", file.type)
    setLoading(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      const csvData = e.target?.result as string
      console.log("CSV cargado, longitud:", csvData.length)
      console.log("Primeras 200 caracteres:", csvData.substring(0, 200))
      
      Papa.parse(csvData, {
        header: true,
        complete: (results: any) => {
          console.log("Parsing completado:", results)
          console.log("Número de filas:", results.data.length)
          console.log("Primera fila:", results.data[0])
          
          if (results.data.length === 0) {
            setError("El archivo CSV está vacío o no tiene datos válidos")
            setLoading(false)
            return
          }
          
          const parsedEmails: Email[] = results.data.map((row: any, index: number) => ({
            id: index,
            fecha: cleanCsvValue(row.fecha),
            de: cleanCsvValue(row.de) || "Unknown",
            para: cleanCsvValue(row.para),
            asunto: cleanCsvValue(row.asunto) || "(No Subject)",
            es_respuesta: cleanCsvValue(row.es_respuesta),
            cuerpo: cleanCsvValue(row.cuerpo),
            cc: cleanCsvValue(row.cc),
            bcc: cleanCsvValue(row.bcc),
            message_id: cleanCsvValue(row.message_id),
            in_reply_to: cleanCsvValue(row.in_reply_to),
            references: cleanCsvValue(row.references),
            adjuntos: cleanCsvValue(row.adjuntos),
            tipo_mail: cleanCsvValue(row.tipo_mail),
            de_rol: cleanCsvValue(row.de_rol),
            para_rol: cleanCsvValue(row.para_rol),
            tag_tema: cleanCsvValue(row.tag_tema),
            read: false,
          }))

          console.log("Emails parseados:", parsedEmails.length)
          setEmails(parsedEmails)
          setFilteredEmails(parsedEmails)
          if (parsedEmails.length > 0) {
            setSelectedEmail(parsedEmails[0])
          }
          setLoading(false)
        },
        error: (error: any) => {
          console.error("Error parsing CSV:", error)
          setError(`Error al procesar el archivo CSV: ${error.message}`)
          setLoading(false)
        },
      })
    }

    reader.onerror = (error) => {
      console.error("Error leyendo archivo:", error)
      setError("Error al leer el archivo. Asegúrate de que sea un archivo CSV válido.")
      setLoading(false)
    }

    reader.readAsText(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    let filtered = emails

    // Aplicar filtros de roles y tags
    if (filters.deRoles.length > 0) {
      filtered = filtered.filter(email => 
        email.de_rol && filters.deRoles.some(role => 
          email.de_rol.split(',').map(r => r.trim()).includes(role)
        )
      )
    }

    if (filters.paraRoles.length > 0) {
      filtered = filtered.filter(email => 
        email.para_rol && filters.paraRoles.some(role => 
          email.para_rol.split(',').map(r => r.trim()).includes(role)
        )
      )
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(email => {
        const emailTags = email.tag_tema ? email.tag_tema.split(',').map(t => t.trim()) : []
        const hasNoTags = !email.tag_tema || email.tag_tema.trim() === ''
        
        return filters.tags.some(tag => {
          if (tag === 'Sin tema') {
            return hasNoTags
          }
          return emailTags.includes(tag)
        })
      })
    }

    // Aplicar búsqueda de texto
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (email) =>
          email.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.de.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.para.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.tag_tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.cuerpo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredEmails(filtered)
  }, [searchTerm, emails, filters])

  const handleFiltersChange = (newFilters: {
    deRoles: string[]
    paraRoles: string[]
    tags: string[]
  }) => {
    setFilters(newFilters)
    setCurrentPage(1) // Resetear a la primera página cuando cambian los filtros
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email)

    // Mark email as read
    setEmails((prevEmails) => prevEmails.map((e) => (e.id === email.id ? { ...e, read: true } : e)))
  }

  const handleEditTags = (email: Email) => {
    setEditingEmail(email)
    setTagEditorOpen(true)
  }

  const handleSaveTags = (emailId: number, newTags: string) => {
    setEmails(prevEmails => 
      prevEmails.map(email => 
        email.id === emailId 
          ? { ...email, tag_tema: newTags }
          : email
      )
    )
    setHasChanges(true)
  }

  const handleDownloadCSV = () => {
    if (emails.length === 0) return

    // Crear el contenido CSV
    const headers = ['fecha', 'de', 'para', 'asunto', 'es_respuesta', 'cuerpo', 'cc', 'bcc', 'message_id', 'in_reply_to', 'references', 'adjuntos', 'tipo_mail', 'de_rol', 'para_rol', 'tag_tema']
    const csvContent = [
      headers.join(','),
      ...emails.map(email => [
        email.fecha,
        email.de,
        email.para,
        `"${email.asunto.replace(/"/g, '""')}"`,
        email.es_respuesta,
        `"${email.cuerpo.replace(/"/g, '""')}"`,
        email.cc,
        email.bcc,
        email.message_id,
        email.in_reply_to,
        email.references,
        email.adjuntos,
        email.tipo_mail,
        email.de_rol,
        email.para_rol,
        email.tag_tema
      ].join(','))
    ].join('\n')

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'emails_actualizados.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setHasChanges(false)
  }

  // Obtener todas las etiquetas únicas del sistema
  const getAllTags = () => {
    const allTags = new Set<string>()
    emails.forEach(email => {
      if (email.tag_tema) {
        email.tag_tema.split(',').forEach(tag => {
          const trimmedTag = tag.trim()
          if (trimmedTag) {
            allTags.add(trimmedTag)
          }
        })
      }
    })
    return Array.from(allTags).sort()
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Visualizador de Emails
          </Typography>
          {hasChanges && (
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleDownloadCSV}
              startIcon={<DownloadIcon />}
            >
              Descargar CSV Actualizado
            </Button>
          )}
        </Box>

        {emails.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" gutterBottom>
              Sube un archivo CSV para comenzar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              El archivo debe contener las columnas: fecha, de, para, asunto, es_respuesta, cuerpo, cc, bcc, message_id, in_reply_to, references, adjuntos, tipo_mail, de_rol, para_rol, tag_tema
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
                {error}
              </Alert>
            )}
            
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleUploadClick}
              size="large"
            >
              Subir archivo CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <SearchIcon sx={{ color: "text.secondary" }} />
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar emails..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={handleUploadClick}
              >
                Cambiar archivo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </Box>

            <FilterPanel 
              emails={emails} 
              onFiltersChange={handleFiltersChange} 
            />

           

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {isMobile ? (
                // Mobile layout - stacked
                <>
                  {!selectedEmail ? (
                    <Box>
                      <EmailList
                        emails={filteredEmails}
                        selectedEmailId={(selectedEmail as Email | null)?.id}
                        onEmailSelect={handleEmailSelect}
                        page={currentPage}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                      />
                    </Box>
                  ) : (
                    <Box>
                      <EmailDetail 
                        email={selectedEmail} 
                        onBack={() => setSelectedEmail(null)}
                        onEditTags={handleEditTags}
                      />
                    </Box>
                  )}
                </>
              ) : (
                // Desktop layout - side by side
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: '0 0 33.333%' }}>
                    <EmailList
                      emails={filteredEmails}
                      selectedEmailId={(selectedEmail as Email | null)?.id}
                      onEmailSelect={handleEmailSelect}
                      page={currentPage}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                    />
                  </Box>
                  <Box sx={{ flex: '1' }}>
                    {selectedEmail && (
                      <EmailDetail 
                        email={selectedEmail} 
                        onBack={() => setSelectedEmail(null)}
                        onEditTags={handleEditTags}
                      />
                    )}
                  </Box>
                </Box>
              )}
              </Box>
              
               {filteredEmails.length > 0 && (
              <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Mostrando {filteredEmails.length} de {emails.length} emails
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Por página</InputLabel>
                    <Select
                      value={itemsPerPage}
                      label="Por página"
                      onChange={(e) => {
                        setItemsPerPage(e.target.value as number)
                        setCurrentPage(1) // Resetear a la primera página
                      }}
                    >
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                      <MenuItem value={200}>200</MenuItem>
                    </Select>
                  </FormControl>
                  {Math.ceil(filteredEmails.length / itemsPerPage) > 1 && (
                    <Typography variant="body2" color="text.secondary">
                      Página {currentPage} de {Math.ceil(filteredEmails.length / itemsPerPage)}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </>
        )}
      </Container>

      <TagEditor
        open={tagEditorOpen}
        onClose={() => setTagEditorOpen(false)}
        email={editingEmail}
        onSave={handleSaveTags}
        allTags={getAllTags()}
      />
    </>
  )
}
